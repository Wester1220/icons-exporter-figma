import { useState, useEffect, useCallback, useRef } from "react";
import { ExportResult, SelectedNode } from "../types";
import { extractTags, toPascalCase, toKebabCase } from "../../utils";
import JSZip from "jszip";

// 消息类型常量
export const MESSAGE_TYPES = {
  EXPORT_SVG: "export-svg",
  EXPORT_RESULT: "export-result",
  UPDATE_TAGS: "update-tags",
  TAGS_UPDATED: "tags-updated",
  RENAME_FRAME: "rename-frame",
  RENAME_UPDATED: "rename-updated",
  GET_SELECTION: "get-selection",
  SELECTION_UPDATED: "selection-updated",
  BATCH_ADD_TAG: "batch-add-tag",
  BATCH_REMOVE_TAG: "batch-remove-tag",
  BATCH_TAGS_UPDATED: "batch-tags-updated",
  CLOSE: "close",
} as const;

/**
 * 处理与Figma插件通信的自定义Hook
 * 管理导出结果、状态消息和操作函数
 */
export function usePluginMessages() {
  // 状态管理
  const [status, setStatus] = useState<string>("Ready to export...");
  const [results, setResults] = useState<ExportResult[]>([]);
  const [loading, setLoading] = useState({
    export: false,
    tags: false,
    rename: false,
  });

  // 使用ref记录最新的results，避免useEffect依赖过多导致不必要的重新订阅
  const resultsRef = useRef<ExportResult[]>(results);
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  // 使用ref记录批量操作队列
  const batchQueueRef = useRef<{
    type: "add" | "remove";
    tag: string;
    nodeIds: string[];
    currentIndex: number;
    processing: boolean;
  } | null>(null);

  // 处理导出图标
  const exportFrames = useCallback(() => {
    setLoading((prev) => ({ ...prev, export: true }));
    setStatus("Exporting...");
    parent.postMessage(
      {
        pluginMessage: {
          type: MESSAGE_TYPES.EXPORT_SVG,
        },
      },
      "*"
    );
  }, []);

  // 处理标签更新
  const updateTags = useCallback((nodeId: string, tags: string) => {
    setLoading((prev) => ({ ...prev, tags: true }));
    parent.postMessage(
      {
        pluginMessage: {
          type: MESSAGE_TYPES.UPDATE_TAGS,
          nodeId,
          tags,
        },
      },
      "*"
    );
  }, []);

  // 处理重命名
  const renameFrame = useCallback((nodeId: string, newName: string) => {
    setLoading((prev) => ({ ...prev, rename: true }));
    parent.postMessage(
      {
        pluginMessage: {
          type: MESSAGE_TYPES.RENAME_FRAME,
          nodeId,
          newName,
        },
      },
      "*"
    );
  }, []);

  // 下载所有图标
  const downloadAll = useCallback(async () => {
    if (resultsRef.current.length === 0) return;

    try {
      const zip = new JSZip();

      // 使用当前页面名称（category）作为文件夹名称和zip名称
      const pageName = resultsRef.current[0]?.metadata?.category || "icons";
      const iconsFolder = zip.folder(pageName);

      if (!iconsFolder) {
        setStatus("Error creating zip folder");
        return;
      }

      // 将所有SVG添加到zip，并为每个SVG创建对应的metadata文件
      resultsRef.current.forEach((result) => {
        // 处理SVG
        const processedSvg = processSvg(result.svg);

        // 添加SVG文件
        iconsFolder.file(result.metadata.filename, processedSvg);

        // 为每个SVG创建一个同名的metadata文件
        const metadataFilename = result.metadata.filename.replace(
          ".svg",
          ".json"
        );
        iconsFolder.file(
          metadataFilename,
          JSON.stringify(result.metadata, null, 2)
        );
      });

      // 生成zip文件
      const content = await zip.generateAsync({ type: "blob" });

      // 创建一个下载链接并触发下载
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `${pageName}.zip`;
      link.click();

      setStatus(
        `Downloaded ${resultsRef.current.length} ${
          resultsRef.current.length > 1 ? "icons" : "icon"
        }`
      );
    } catch (error) {
      console.error("Error creating zip:", error);
      setStatus("Error creating zip file");
    }
  }, []);

  // SVG处理函数，将style属性转换为直接属性
  const processSvg = (svgString: string): string => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, "image/svg+xml");

      // 查找所有带有style属性的元素
      const elementsWithStyle = doc.querySelectorAll("[style]");

      // 处理每个元素
      elementsWithStyle.forEach((el) => {
        const style = el.getAttribute("style");
        if (!style) return;

        // 解析样式字符串
        const styleProps = style
          .split(";")
          .filter((prop) => prop.trim() !== "");

        // 将每个样式属性转换为XML属性
        styleProps.forEach((prop) => {
          const [name, value] = prop.split(":").map((part) => part.trim());
          if (name && value) {
            // 将驼峰式CSS属性转换为横线连接的SVG属性
            const svgAttrName = name.replace(/([A-Z])/g, "-$1").toLowerCase();
            el.setAttribute(svgAttrName, value);
          }
        });

        // 删除原始style属性
        el.removeAttribute("style");
      });

      // 将修改后的DOM转换回字符串
      const serializer = new XMLSerializer();
      return serializer.serializeToString(doc);
    } catch (error) {
      console.error("Error processing SVG:", error);
      return svgString; // 发生错误时返回原始字符串
    }
  };

  // 处理批量标签队列
  const processBatchQueue = useCallback(() => {
    const queue = batchQueueRef.current;
    if (!queue || queue.processing === false) return;

    // 如果队列中的所有项都已处理完毕
    if (queue.currentIndex >= queue.nodeIds.length) {
      // 重置队列
      batchQueueRef.current = null;
      setLoading((prev) => ({ ...prev, tags: false }));
      setStatus(`Batch ${queue.type} tag operation completed`);
      return;
    }

    // 获取当前要处理的节点
    const nodeId = queue.nodeIds[queue.currentIndex];

    // 发送消息处理单个节点
    parent.postMessage(
      {
        pluginMessage: {
          type:
            queue.type === "add"
              ? MESSAGE_TYPES.UPDATE_TAGS
              : MESSAGE_TYPES.UPDATE_TAGS,
          nodeId: nodeId,
          tags: queue.tag, // 对于添加，这是要添加的标签；对于删除，这是要删除的标签
          operation: queue.type, // 添加额外参数表明操作类型
        },
      },
      "*"
    );

    // 更新队列中的索引
    batchQueueRef.current.currentIndex++;

    // 更新状态消息
    setStatus(`Processing ${queue.currentIndex} of ${queue.nodeIds.length}...`);
  }, []);

  // 每当标签更新成功时，处理队列中的下一个项
  useEffect(() => {
    if (batchQueueRef.current && !loading.tags) {
      // 设置一个小延迟，避免请求太快
      const timeoutId = setTimeout(() => {
        if (batchQueueRef.current) {
          setLoading((prev) => ({ ...prev, tags: true }));
          processBatchQueue();
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [loading.tags, processBatchQueue]);

  // 处理批量添加标签 - 只初始化队列，不执行实际操作
  const batchAddTag = useCallback(
    (tag: string) => {
      if (!tag.trim() || resultsRef.current.length < 2) return;

      const nodeIds = resultsRef.current.map((result) => result.nodeId);

      // 设置批量操作队列
      batchQueueRef.current = {
        type: "add",
        tag: tag.trim(),
        nodeIds: nodeIds,
        currentIndex: 0,
        processing: true,
      };

      // 开始处理队列
      setLoading((prev) => ({ ...prev, tags: true }));
      processBatchQueue();
    },
    [processBatchQueue]
  );

  // 处理批量删除标签 - 只初始化队列，不执行实际操作
  const batchRemoveTag = useCallback(
    (tag: string) => {
      if (!tag.trim() || resultsRef.current.length < 2) return;

      const nodeIds = resultsRef.current.map((result) => result.nodeId);

      // 设置批量操作队列
      batchQueueRef.current = {
        type: "remove",
        tag: tag.trim(),
        nodeIds: nodeIds,
        currentIndex: 0,
        processing: true,
      };

      // 开始处理队列
      setLoading((prev) => ({ ...prev, tags: true }));
      processBatchQueue();
    },
    [processBatchQueue]
  );

  // 设置消息监听
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = event.data.pluginMessage;
        if (!message) return;

        switch (message.type) {
          case MESSAGE_TYPES.EXPORT_RESULT: {
            setLoading((prev) => ({ ...prev, export: false, tags: false })); // 同时清除标签操作的loading状态
            const exportResults = message.data;

            // 确保每个导出结果的 metadata.name 使用正确的 PascalCase 格式
            const processedResults = exportResults.map(
              (result: ExportResult) => {
                const { cleanName } = extractTags(
                  result.metadata.filename.replace(".svg", "")
                );
                return {
                  ...result,
                  metadata: {
                    ...result.metadata,
                    name: toPascalCase(cleanName),
                  },
                };
              }
            );

            setResults(processedResults);

            if (processedResults.length === 0) {
              setStatus("No frames selected for export");
            } else {
              setStatus(
                `Exported ${processedResults.length} ${
                  processedResults.length > 1 ? "icons" : "icon"
                }`
              );
            }
            break;
          }

          case MESSAGE_TYPES.SELECTION_UPDATED: {
            // 当选择变更或其他更新时，如果我们已经有results，只更新它们的metadata但不清除
            if (resultsRef.current.length > 0) {
              // 获取当前选择的节点信息
              const selectionNodes = message.nodes;

              // 即使没有选中的节点，我们也不清空结果，而是保留之前的结果
              // 仅更新可见节点的元数据
              if (selectionNodes.length > 0) {
                // 更新已有的results
                setResults((prevResults) => {
                  return prevResults.map((result) => {
                    // 查找对应的节点
                    const matchingNode = selectionNodes.find(
                      (node: SelectedNode) => node.id === result.nodeId
                    );

                    if (matchingNode) {
                      // 从节点名称中提取新的元数据和标签
                      const frameName = matchingNode.name;
                      const { cleanName, tags } = extractTags(frameName);

                      // 使用共享工具函数
                      const pascalCaseName = toPascalCase(cleanName);
                      const kebabCaseName = toKebabCase(cleanName);

                      // 创建更新后的metadata，包括最新的标签
                      const updatedMetadata = {
                        ...result.metadata,
                        name: pascalCaseName,
                        filename: `${kebabCaseName}.svg`,
                        tags: tags, // 更新标签数组
                      };

                      // 返回更新后的result
                      return {
                        ...result,
                        metadata: updatedMetadata,
                      };
                    }
                    return result;
                  });
                });
              }
            }
            break;
          }

          case MESSAGE_TYPES.TAGS_UPDATED: {
            setLoading((prev) => ({ ...prev, tags: false }));
            // 立即更新选区信息，以获取最新的标签
            parent.postMessage(
              {
                pluginMessage: {
                  type: MESSAGE_TYPES.GET_SELECTION,
                },
              },
              "*"
            );

            // 如果消息中包含更新后的名称，尝试直接更新对应的结果
            if (message.nodeId && message.updatedName) {
              setResults((prevResults) => {
                return prevResults.map((result) => {
                  if (result.nodeId === message.nodeId) {
                    const { cleanName, tags } = extractTags(
                      message.updatedName
                    );
                    const pascalCaseName = toPascalCase(cleanName);
                    const kebabCaseName = toKebabCase(cleanName);

                    return {
                      ...result,
                      metadata: {
                        ...result.metadata,
                        name: pascalCaseName,
                        filename: `${kebabCaseName}.svg`,
                        tags: tags,
                      },
                    };
                  }
                  return result;
                });
              });
            }

            // 显示状态消息提示用户
            setStatus("Tags updated successfully!");
            break;
          }

          case MESSAGE_TYPES.RENAME_UPDATED: {
            setLoading((prev) => ({ ...prev, rename: false }));
            // 立即更新选区信息，以获取最新的名称
            parent.postMessage(
              {
                pluginMessage: {
                  type: MESSAGE_TYPES.GET_SELECTION,
                },
              },
              "*"
            );

            // 如果消息中包含更新后的名称，尝试直接更新对应的结果
            if (message.nodeId && message.updatedName) {
              setResults((prevResults) => {
                return prevResults.map((result) => {
                  if (result.nodeId === message.nodeId) {
                    const { cleanName, tags } = extractTags(
                      message.updatedName
                    );
                    const pascalCaseName = toPascalCase(cleanName);
                    const kebabCaseName = toKebabCase(cleanName);

                    return {
                      ...result,
                      metadata: {
                        ...result.metadata,
                        name: pascalCaseName,
                        filename: `${kebabCaseName}.svg`,
                        tags: tags,
                      },
                    };
                  }
                  return result;
                });
              });
            }

            // 显示状态消息提示用户
            setStatus("Frame renamed successfully!");
            break;
          }

          case MESSAGE_TYPES.BATCH_TAGS_UPDATED: {
            setLoading((prev) => ({ ...prev, tags: false }));
            // 立即更新选区信息，以获取最新的标签
            parent.postMessage(
              {
                pluginMessage: {
                  type: MESSAGE_TYPES.GET_SELECTION,
                },
              },
              "*"
            );

            // 如果消息中包含更新后的节点信息，更新对应的结果
            if (message.updatedNodes && Array.isArray(message.updatedNodes)) {
              setResults((prevResults) => {
                return prevResults.map((result) => {
                  // 找到对应的已更新节点
                  const updatedNode = message.updatedNodes.find(
                    (node: { id: string; name: string }) =>
                      node.id === result.nodeId
                  );

                  if (updatedNode && updatedNode.name) {
                    const { cleanName, tags } = extractTags(updatedNode.name);
                    const pascalCaseName = toPascalCase(cleanName);
                    const kebabCaseName = toKebabCase(cleanName);

                    return {
                      ...result,
                      metadata: {
                        ...result.metadata,
                        name: pascalCaseName,
                        filename: `${kebabCaseName}.svg`,
                        tags: tags,
                      },
                    };
                  }
                  return result;
                });
              });
            }

            // 显示状态消息提示用户
            setStatus("Tags updated successfully!");
            break;
          }

          default:
            break;
        }
      } catch (error) {
        console.error("Error processing plugin message:", error);
        setStatus("Error occurred. Check console for details.");
      }
    };

    // 设置消息监听器
    window.onmessage = handleMessage;

    // 在组件挂载时请求当前选择
    parent.postMessage(
      {
        pluginMessage: {
          type: MESSAGE_TYPES.GET_SELECTION,
        },
      },
      "*"
    );

    // 清理函数
    return () => {
      window.onmessage = null;
    };
  }, []); // 空依赖数组，只在组件挂载时设置一次监听器

  // 返回所有需要的状态和函数
  return {
    status,
    results,
    loading,
    exportFrames,
    updateTags,
    renameFrame,
    downloadAll,
    batchAddTag,
    batchRemoveTag,
  };
}
