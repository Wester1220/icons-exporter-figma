import React from "react";
import { usePluginMessages } from "../hooks/usePluginMessages";
import IconResult from "./IconResult";

const App: React.FC = () => {
  // 使用我们的自定义钩子管理与插件的通信
  const {
    status,
    results,
    loading,
    exportFrames,
    updateTags,
    renameFrame,
    downloadAll,
  } = usePluginMessages();

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

      <div className="status" role="status" aria-live="polite">
        {status}
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
