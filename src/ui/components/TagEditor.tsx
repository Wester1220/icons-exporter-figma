import React, { useState } from "react";
import { tagPresets } from "../types";
import TagInput from "./TagInput";

interface TagEditorProps {
  initialTags: string;
  onConfirm: (tags: string) => void;
  onCancel: () => void;
}

const TagEditor: React.FC<TagEditorProps> = ({
  initialTags,
  onConfirm,
  onCancel,
}) => {
  const [tags, setTags] = useState(initialTags);
  const [selectedPreset, setSelectedPreset] = useState("");

  // Handle tag input changes
  const handleTagChange = (newTags: string) => {
    setTags(newTags);
  };

  // Handle preset selection changes
  const handlePresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPreset(event.target.value);
  };

  // Handle preset tag click
  const handlePresetTagClick = (tag: string) => {
    // Check if tag already exists in the current tags
    const currentTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!currentTags.includes(tag)) {
      // Add the tag
      const newTags = [...currentTags, tag].join(",");
      setTags(newTags);
    }
  };

  // Handle confirm button click
  const handleConfirm = () => {
    onConfirm(tags);
  };

  return (
    <div className="inline-editor">
      <TagInput
        value={tags}
        onChange={handleTagChange}
        placeholder="Add tags..."
      />

      <div className="preset-container">
        <label className="preset-label">Preset Tags:</label>
        <select
          className="preset-dropdown"
          value={selectedPreset}
          onChange={handlePresetChange}
        >
          <option value="">-- Select Preset --</option>
          {Object.keys(tagPresets).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {selectedPreset && (
          <div className="preset-tags">
            {tagPresets[selectedPreset].map((tag) => (
              <span
                key={tag}
                className="preset-tag"
                onClick={() => handlePresetTagClick(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="edit-buttons">
        <button onClick={handleConfirm} data-variant="primary">
          Confirm
        </button>
        <button onClick={onCancel} data-variant="secondary">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TagEditor;
