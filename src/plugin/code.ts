/// <reference types="@figma/plugin-typings" />
import {
  extractTags,
  toPascalCase,
  toKebabCase,
  updateFrameNameWithTags,
  renameFrameKeepTags,
} from "../utils";

figma.showUI(__html__, { width: 400, height: 720 });

interface IconMetadata {
  name: string;
  category: string;
  width: number;
  height: number;
  tags: string[];
  filename: string;
}

// 发送当前选择到UI当它加载时
function updateSelectionInfo() {
  const nodes = figma.currentPage.selection;
  const selectionInfo = nodes.map((node) => {
    return {
      id: node.id,
      name: node.name,
      type: node.type,
    };
  });

  figma.ui.postMessage({
    type: "selection-updated",
    nodes: selectionInfo,
  });
}

// 处理来自UI的消息
figma.ui.onmessage = async (msg) => {
  if (msg.type === "export-svg") {
    const nodes = figma.currentPage.selection;
    const result: { svg: string; metadata: IconMetadata; nodeId: string }[] =
      [];

    // 如果没有选择任何框架，显示通知并发送空结果
    if (nodes.length === 0) {
      figma.notify("Please select at least one frame to export");
      // 发送空的结果数组，以便UI清除之前的结果并显示no-results
      figma.ui.postMessage({
        type: "export-result",
        data: [],
      });
      return;
    }

    // 处理每个选中的节点
    for (const node of nodes) {
      // 只处理框架
      if (node.type !== "FRAME") {
        figma.notify(`Skipping ${node.name}: Only frames can be exported`);
        continue;
      }

      try {
        // 导出节点为SVG
        const svgData = await node.exportAsync({
          format: "SVG",
          svgOutlineText: true,
          svgIdAttribute: true,
          svgSimplifyStroke: true,
          useAbsoluteBounds: true,
          colorProfile: "SRGB",
        });

        const svgString = String.fromCharCode.apply(
          null,
          new Uint8Array(svgData) as unknown as number[]
        );

        // 获取框架的属性以用于元数据
        const frameName = node.name;

        // 提取标签和清理名称
        const { cleanName, tags } = extractTags(frameName);

        // 将PascalCase用于'name'字段
        const pascalCaseName = toPascalCase(cleanName);

        // 使用kebab-case用于文件名
        const kebabCaseName = toKebabCase(cleanName);

        // 为这个图标创建元数据
        const metadata: IconMetadata = {
          name: pascalCaseName,
          filename: `${kebabCaseName}.svg`,
          category: figma.currentPage.name, // 使用页面名称作为类别
          width: Math.round(node.width),
          height: Math.round(node.height),
          tags: tags,
        };

        result.push({
          svg: svgString,
          metadata: metadata,
          nodeId: node.id,
        });
      } catch (error) {
        figma.notify(`Error exporting ${node.name}: ${error}`);
      }
    }

    // 将结果发送回UI
    figma.ui.postMessage({
      type: "export-result",
      data: result,
    });
  } else if (msg.type === "update-tags") {
    const { nodeId, tags } = msg;

    // 通过ID查找节点
    const node = figma.getNodeById(nodeId);

    if (node) {
      // 更新框架名称与新标签
      const updatedName = updateFrameNameWithTags(node.name, tags);
      node.name = updatedName;

      figma.ui.postMessage({
        type: "tags-updated",
        nodeId: nodeId,
      });

      figma.notify("Tags updated successfully!");
    } else {
      figma.notify("Error: Node not found!");
    }
  } else if (msg.type === "rename-frame") {
    const { nodeId, newName } = msg;

    // 通过ID查找节点
    const node = figma.getNodeById(nodeId);

    if (node) {
      // 重命名框架但保持现有标签
      const updatedName = renameFrameKeepTags(node.name, newName);
      node.name = updatedName;

      figma.ui.postMessage({
        type: "rename-updated",
        nodeId: nodeId,
      });

      figma.notify("Frame renamed successfully!");
    } else {
      figma.notify("Error: Node not found!");
    }
  } else if (msg.type === "get-selection") {
    updateSelectionInfo();
  } else if (msg.type === "close") {
    figma.closePlugin();
  }
};

// 当选择变更时更新选择信息
figma.on("selectionchange", () => {
  updateSelectionInfo();
});
