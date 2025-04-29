// 通用辅助函数

/**
 * 从框架名称中提取标签
 * @param name 框架名称，可能包含标签 [tag1,tag2]
 * @returns 清理后的名称和标签数组
 */
export function extractTags(name: string): {
  cleanName: string;
  tags: string[];
} {
  let cleanName = name;
  const tags: string[] = [];

  // 如果标签在方括号中，如 [tag1,tag2]
  const tagMatch = cleanName.match(/\[(.*?)\]/);

  if (tagMatch) {
    const tagString = tagMatch[1];
    tags.push(...tagString.split(",").map((tag) => tag.trim()));
    cleanName = cleanName.replace(/\[.*?\]/, "").trim();
  }

  return { cleanName, tags };
}

/**
 * 将字符串转换为 PascalCase 命名
 * @param str 输入字符串
 * @returns PascalCase 格式的字符串
 */
export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

/**
 * 将字符串转换为 kebab-case 命名
 * @param str 输入字符串
 * @returns kebab-case 格式的字符串
 */
export function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-");
}

/**
 * 更新框架名称与新标签
 * @param name 原始框架名称
 * @param tags 新的标签字符串
 * @returns 更新后的框架名称
 */
export function updateFrameNameWithTags(name: string, tags: string): string {
  // 移除现有标签
  let cleanName = name.replace(/\[.*?\]/, "").trim();

  // 如果提供了新标签，添加它们
  if (tags && tags.length > 0) {
    cleanName = `${cleanName}[${tags}]`;
  }

  return cleanName;
}

/**
 * 重命名框架但保持标签
 * @param name 原始框架名称
 * @param newName 新的框架名称
 * @returns 重命名后的框架名称，保留原始标签
 */
export function renameFrameKeepTags(name: string, newName: string): string {
  // 提取标签
  const { tags } = extractTags(name);

  // 创建新的名称，保持相同的标签
  let result = newName.trim();
  if (tags.length > 0) {
    result = `${result}[${tags.join(",")}]`;
  }

  return result;
}
