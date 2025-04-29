import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import { ExportResult } from "../types";
import TagEditor from "./TagEditor";

interface IconResultProps {
  result: ExportResult;
  onTagUpdate: (nodeId: string, tags: string) => void;
  onRename?: (nodeId: string, newName: string) => void;
}

const IconResult: React.FC<IconResultProps> = ({
  result,
  onTagUpdate,
  onRename,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameValue, setNameValue] = useState("");

  const { svg, metadata, nodeId } = result;

  // 通过将SVG字符串注入到容器中创建SVG预览
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (svgContainerRef.current) {
      svgContainerRef.current.innerHTML = svg;
    }
  }, [svg]);

  // 当开始重命名时，设置初始名称值 (不包含标签部分)
  useEffect(() => {
    if (isRenaming) {
      // 从完整的名称中提取 [ 前面的部分
      const baseName = metadata.filename
        .split("[")[0]
        .trim()
        .replace(/.svg$/, "");
      setNameValue(baseName);

      // 自动聚焦输入框
      setTimeout(() => {
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
      }, 10);
    }
  }, [isRenaming, metadata.filename]);

  // 切换标签编辑器
  const handleEditClick = () => {
    setIsEditing(true);
    setIsRenaming(false);
  };

  // 当编辑被取消时
  const handleEditCancel = () => {
    setIsEditing(false);
  };

  // 当标签更新被确认时
  const handleConfirmTags = (tags: string) => {
    onTagUpdate(nodeId, tags);
    setIsEditing(false);
  };

  // 开始重命名
  const handleRenameClick = () => {
    setIsRenaming(true);
    setIsEditing(false);
  };

  // 处理重命名取消
  const handleRenameCancel = () => {
    setIsRenaming(false);
  };

  // 处理重命名确认
  const handleRenameConfirm = () => {
    if (onRename && nameValue.trim()) {
      onRename(nodeId, nameValue.trim());
    }
    setIsRenaming(false);
  };

  // 处理重命名输入框键盘事件
  const handleRenameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRenameConfirm();
    } else if (e.key === "Escape") {
      handleRenameCancel();
    }
  };

  return (
    <div className="icon-result" data-node-id={nodeId}>
      <div className="preview">
        <div ref={svgContainerRef} className="svg-container"></div>

        {!isEditing && !isRenaming && (
          <>
            <div className="name-display">{metadata.filename}</div>
            <button
              className="rename-btn"
              data-variant="secondary"
              onClick={handleRenameClick}
            >
              Rename
            </button>
            <button
              className="edit-tags-btn"
              data-variant="primary"
              onClick={handleEditClick}
            >
              Edit Tags
            </button>
          </>
        )}

        {isRenaming && (
          <div className="rename-container">
            <input
              ref={renameInputRef}
              type="text"
              className="rename-input"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={handleRenameKeyDown}
              placeholder="Enter new name"
            />
            <div className="edit-buttons">
              <button
                className="confirm-btn"
                data-variant="primary"
                onClick={handleRenameConfirm}
              >
                Save
              </button>
              <button
                className="cancel-btn"
                data-variant="secondary"
                onClick={handleRenameCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isEditing && (
          <TagEditor
            initialTags={metadata.tags.join(",")}
            onConfirm={handleConfirmTags}
            onCancel={handleEditCancel}
          />
        )}
      </div>

      <div className="metadata">{JSON.stringify(metadata, null, 2)}</div>
    </div>
  );
};

export default IconResult;
