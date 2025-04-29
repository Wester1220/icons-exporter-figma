import React, { useEffect, useState } from "react";
import IconResult from "./IconResult";
import { ExportResult, SelectedNode } from "../types";
import JSZip from "jszip";
import { extractTags, toPascalCase, toKebabCase } from "../../utils";

const App: React.FC = () => {
  const [status, setStatus] = useState<string>("Ready to export...");
  const [results, setResults] = useState<ExportResult[]>([]);

  // 监听来自插件的消息
  useEffect(() => {
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;

      if (!message) return;

      if (message.type === "export-result") {
        const exportResults = message.data;

        // 确保每个导出结果的 metadata.name 使用正确的 PascalCase 格式
        const processedResults = exportResults.map((result: ExportResult) => {
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
        });

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
      } else if (message.type === "selection-updated") {
        // 当选择变更时，我们只保存选中的节点状态，但不清除结果
        // 只有在点击 Export Selected Frames 时才会根据当前选择更新结果

        // 当选择变更或其他更新时，如果我们已经有results，只更新它们的metadata但不清除
        if (results.length > 0) {
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
      } else if (message.type === "tags-updated") {
        // 立即更新选区信息，以获取最新的标签
        parent.postMessage({ pluginMessage: { type: "get-selection" } }, "*");

        // 显示状态消息提示用户
        setStatus("Tags updated successfully!");
      } else if (message.type === "rename-updated") {
        // 立即更新选区信息，以获取最新的名称
        parent.postMessage({ pluginMessage: { type: "get-selection" } }, "*");

        // 显示状态消息提示用户
        setStatus("Frame renamed successfully!");
      }
    };

    // 在组件挂载时请求当前选择
    parent.postMessage({ pluginMessage: { type: "get-selection" } }, "*");

    return () => {
      window.onmessage = null;
    };
  }, [results.length]);

  // 处理导出SVG
  const handleExport = () => {
    setStatus("Exporting...");
    parent.postMessage({ pluginMessage: { type: "export-svg" } }, "*");
  };

  // 处理下载所有文件作为zip
  const handleDownloadAll = async () => {
    if (results.length === 0) return;

    try {
      const zip = new JSZip();

      // 使用当前页面名称（category）作为文件夹名称和zip名称
      const pageName = results[0]?.metadata?.category || "icons";
      const iconsFolder = zip.folder(pageName);

      if (!iconsFolder) {
        setStatus("Error creating zip folder");
        return;
      }

      // 将所有SVG添加到zip，并为每个SVG创建对应的metadata文件
      results.forEach((result) => {
        // 添加SVG文件
        iconsFolder.file(result.metadata.filename, result.svg);

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

      setStatus(`Downloaded ${results.length} icon(s)`);
    } catch (error) {
      console.error("Error creating zip:", error);
      setStatus("Error creating zip file");
    }
  };

  // 处理特定图标的标签更新
  const handleTagUpdate = (nodeId: string, tags: string) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "update-tags",
          nodeId,
          tags,
        },
      },
      "*"
    );
  };

  // 处理特定图标的重命名
  const handleRename = (nodeId: string, newName: string) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "rename-frame",
          nodeId,
          newName,
        },
      },
      "*"
    );
  };

  return (
    <div className="app-container">
      <p className="app-description">
        Select frames to export as SVG with metadata
      </p>

      <div className="controls">
        <button
          onClick={handleExport}
          aria-label="Export Selected Frames"
          data-variant={"primary"}
        >
          Export Selected Frames
        </button>

        <button
          id="downloadAll"
          onClick={handleDownloadAll}
          aria-label="Download All Files"
          aria-disabled={results.length === 0}
          data-variant={"success"}
          data-disabled={results.length === 0}
        >
          Download All
        </button>
      </div>

      <div className="status" role="status" aria-live="polite">
        {status}
      </div>

      <div className="results" role="region" aria-label="Export Results">
        {results.map((result, index) => (
          <IconResult
            key={`${result.nodeId}-${index}`}
            result={result}
            onTagUpdate={handleTagUpdate}
            onRename={handleRename}
          />
        ))}
        {results.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">
              <svg width="48" height="48" fill="none" viewBox="0 0 16 16">
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m1 1 5.822 14L8.89 8.914 15 6.822z"
                />
              </svg>
            </div>

            <ol>
              <li>Select one or more frames in your Figma file</li>
              <li>Click "Export Selected Frames" to generate SVGs</li>
              <li>Edit tags or rename frames if needed</li>
              <li>Use "Download All" to get your icons with metadata</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
