// Types for the plugin
export interface IconMetadata {
  name: string;
  category: string;
  width: number;
  height: number;
  tags: string[];
  filename: string;
}

export interface ExportResult {
  svg: string;
  metadata: IconMetadata;
  nodeId: string;
}

export interface SelectedNode {
  id: string;
  name: string;
  type: string;
}

// Preset tags
export const tagPresets: Record<string, string[]> = {
  "UI Elements": [
    "button",
    "input",
    "checkbox",
    "radio",
    "select",
    "modal",
    "card",
    "dropdown",
  ],
  Add: ["add", "plus", "create", "new", "plus"],
  Remove: ["remove", "minus", "delete", "close", "minus"],
  Users: [
    "user",
    "account",
    "profile",
    "avatar",
    "person",
    "human",
    "member",
    "organization",
    "group",
    "team",
  ],
  Organizations: [
    "organization",
    "company",
    "business",
    "building",
    "enterprise",
    "group",
  ],
  Folders: [
    "folder",
    "directory",
    "folder-open",
    "folder-closed",
    "file",
    "catalog",
  ],
  Files: [
    "file",
    "document",
    "note",
    "page",
    "draft",
    "item",
    "sheet",
    "content",
    "data",
  ],
  Images: ["image", "photo", "picture", "media", "gallery", "graphic"],
  Lock: ["lock", "locked", "secure", "password", "key", "safety", "privacy"],
  Notifications: [
    "bell",
    "notification",
    "alarm",
    "buzz",
    "alert",
    "sound",
    "audio",
  ],
  Search: ["search", "find", "lookup", "explore", "magnifier"],
  System: [
    "system",
    "settings",
    "gear",
    "cog",
    "tools",
    "control",
    "preferences",
  ],
  Editor: ["edit", "design", "pen", "pencil", "draw", "create"],
  Navigation: [
    "menu",
    "sidebar",
    "navbar",
    "breadcrumb",
    "pagination",
    "tab",
    "link",
    "arrow",
  ],
  Actions: [
    "add",
    "remove",
    "delete",
    "edit",
    "save",
    "cancel",
    "upload",
    "download",
  ],
  Feedback: [
    "success",
    "error",
    "warning",
    "info",
    "help",
    "notification",
    "alert",
    "progress",
  ],
  Layout: [
    "grid",
    "container",
    "row",
    "column",
    "flex",
    "divider",
    "spacing",
    "alignment",
  ],
  Common: [
    "user",
    "home",
    "search",
    "settings",
    "profile",
    "dashboard",
    "calendar",
    "clock",
  ],
};
