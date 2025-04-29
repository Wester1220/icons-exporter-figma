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
