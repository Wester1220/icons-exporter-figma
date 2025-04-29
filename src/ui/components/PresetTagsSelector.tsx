import React, { useState } from "react";
import { tagPresets } from "../types";

interface PresetTagsSelectorProps {
  onTagSelect: (tag: string) => void;
}

const PresetTagsSelector: React.FC<PresetTagsSelectorProps> = ({
  onTagSelect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleTagClick = (tag: string) => {
    onTagSelect(tag);
  };

  return (
    <div className="preset-container">
      <label className="preset-label">Preset Tags:</label>
      <select
        className="preset-dropdown"
        value={selectedCategory}
        onChange={handleCategoryChange}
      >
        <option value="">-- Select Preset --</option>
        {Object.keys(tagPresets).map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {selectedCategory && (
        <div className="preset-tags">
          {tagPresets[selectedCategory].map((tag) => (
            <span
              key={tag}
              className="preset-tag"
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PresetTagsSelector;
