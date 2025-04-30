import React, { useState } from "react";
import { usePluginMessages } from "../hooks/usePluginMessages";
import IconResult from "./IconResult";
import TagInput from "./TagInput";

const App: React.FC = () => {
  const {
    status,
    results,
    loading,
    exportFrames,
    updateTags,
    renameFrame,
    downloadAll,
    batchAddTag,
    batchRemoveTag,
  } = usePluginMessages();

  // 批量标签状态
  const [batchTagOperation, setBatchTagOperation] = useState<
    "add" | "remove" | null
  >(null);
  const [batchTagsValue, setBatchTagsValue] = useState("");

  // 处理批量操作标签
  const handleBatchTag = () => {
    if (!batchTagsValue.trim()) return;

    // 获取多个标签
    const tags = batchTagsValue
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    if (tags.length === 0) return;

    // 批量处理所有标签
    if (batchTagOperation === "add") {
      // 处理添加标签
      tags.forEach((tag) => batchAddTag(tag));
    } else if (batchTagOperation === "remove") {
      // 处理删除标签
      tags.forEach((tag) => batchRemoveTag(tag));
    }

    // 重置状态
    setBatchTagsValue("");
    setBatchTagOperation(null);

    // 等待所有消息处理完成后，触发一次导出操作来刷新UI
    setTimeout(() => {
      // 重新导出以强制刷新数据
      exportFrames();
    }, 300); // 添加延迟确保前面的操作已经完成
  };

  // 关闭批量标签操作
  const closeBatchTagOperation = () => {
    setBatchTagOperation(null);
    setBatchTagsValue("");
  };

  // 处理标签值变化
  const handleTagsChange = (value: string) => {
    setBatchTagsValue(value);
  };

  return (
    <div className="app-container">
      <p className="app-description">
        Select frames to export as SVG with metadata
      </p>

      <div className="controls">
        <button
          onClick={exportFrames}
          aria-label="Export Selected Frames"
          data-variant={"primary"}
          disabled={loading.export}
        >
          {loading.export ? "Exporting..." : "Export Selected Frames"}
        </button>

        <button
          id="downloadAll"
          onClick={downloadAll}
          aria-label="Download All Files"
          aria-disabled={results.length === 0}
          data-variant={"success"}
          data-disabled={results.length === 0}
        >
          Download All
        </button>
      </div>

      <div className="status-container">
        {!batchTagOperation && (
          <>
            <div className="status" role="status" aria-live="polite">
              {status}
            </div>

            {results.length >= 2 && (
              <div className="batch-controls">
                <span className="batch-edit-tags-label">Batch Edit tags:</span>
                <button
                  onClick={() => setBatchTagOperation("add")}
                  data-variant="secondary"
                  disabled={loading.tags}
                  title="Add tags to all selected icons"
                >
                  Add
                </button>
                <button
                  onClick={() => setBatchTagOperation("remove")}
                  data-variant="secondary"
                  disabled={loading.tags}
                  title="Remove tags from all selected icons"
                >
                  Remove
                </button>
              </div>
            )}
          </>
        )}

        {batchTagOperation && (
          <div className="batch-tag-inline">
            <div className="batch-tag-input-wrapper">
              <TagInput
                value={batchTagsValue}
                onChange={handleTagsChange}
                placeholder={
                  batchTagOperation === "add"
                    ? "Enter tags to add"
                    : "Enter tags to remove"
                }
              />
            </div>
            <div className="batch-controls">
              <button
                onClick={handleBatchTag}
                data-variant="primary"
                disabled={!batchTagsValue.trim() || loading.tags}
              >
                {loading.tags ? "Processing..." : "Confirm"}
              </button>
              <button onClick={closeBatchTagOperation} data-variant="secondary">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="results" role="region" aria-label="Export Results">
        {results.map((result, index) => (
          <IconResult
            key={`${result.nodeId}-${index}`}
            result={result}
            onTagUpdate={updateTags}
            onRename={renameFrame}
          />
        ))}
        {results.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">
              <svg width="48" height="48" fill="none" viewBox="0 0 16 16">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
