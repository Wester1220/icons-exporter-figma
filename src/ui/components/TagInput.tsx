import React, {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

interface Tag {
  id: string;
  text: string;
}

const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  placeholder = "Add tags...",
  className = "",
}) => {
  // 将逗号分隔的标签字符串转换为标签对象数组
  const createTagsFromString = (str: string): Tag[] => {
    if (!str || str.trim() === "") return [];
    return str
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "")
      .map((tag) => ({
        id: `tag-${Math.random().toString(36).substring(2, 9)}`,
        text: tag,
      }));
  };

  const [tags, setTags] = useState<Tag[]>(createTagsFromString(value));
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // 当外部value改变时，更新内部tags状态
  useEffect(() => {
    const newTags = createTagsFromString(value);
    setTags(newTags);
  }, [value]);

  // 将标签数组转换回字符串并触发onChange
  const updateTags = (newTags: Tag[]) => {
    const tagsString = newTags.map((tag) => tag.text).join(",");
    onChange(tagsString);
    setTags(newTags);
  };

  // 添加新标签
  const addTag = (text: string) => {
    if (text && text.trim() !== "") {
      const trimmedText = text.trim();
      // 检查是否已存在相同标签
      if (
        !tags.some(
          (tag) => tag.text.toLowerCase() === trimmedText.toLowerCase()
        )
      ) {
        const newTag: Tag = {
          id: `tag-${Math.random().toString(36).substring(2, 9)}`,
          text: trimmedText,
        };
        updateTags([...tags, newTag]);
      }
      setInputValue("");
    }
  };

  // 移除标签
  const removeTag = (id: string) => {
    const newTags = tags.filter((tag) => tag.id !== id);
    updateTags(newTags);
  };

  // 处理输入框变化
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // 处理键盘事件 (回车添加新标签，退格键删除最后一个标签)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      e.preventDefault();
      removeTag(tags[tags.length - 1].id);
    } else if (e.key === "," || e.key === " ") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  // 处理粘贴事件，按逗号分隔添加多个标签
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedTags = pastedData.split(/[,\s]+/); // 按逗号或空格分割

    pastedTags.forEach((tag) => {
      if (tag.trim() !== "") {
        addTag(tag);
      }
    });
  };

  // 点击容器时聚焦输入框
  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="tag-input-container" onClick={handleContainerClick}>
      <div className="tag-input-tags">
        {tags.map((tag) => (
          <span key={tag.id} className="tag-input-tag">
            <span className="tag-input-tag-text">{tag.text}</span>
            <span
              className="tag-input-tag-remove"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag.id);
              }}
            >
              &times;
            </span>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="tag-input-field"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={tags.length === 0 ? placeholder : ""}
        />
      </div>
    </div>
  );
};

export default TagInput;
