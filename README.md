
![cover](https://github.com/user-attachments/assets/d9cb55e3-7e8e-4f85-8f33-574b7e3e2c9a)


# SVG Icons Exporter - Figma Plugin

A Figma plugin built with React that helps designers and developers quickly edit and export SVG icons along with their metadata. This plugin is particularly useful for managing and maintaining icon libraries.

## Features

- Export selected frames as SVG icons
- Automatically generates metadata for each icon (name, dimensions, category)
- Add and edit tags for icons directly in the UI using a custom TagInput component
- Choose from preset tag categories
- Download all icons and metadata as a ZIP file

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. Clone this repository
2. Install dependencies:

   ```
   npm install
   ```

   or

   ```
   yarn
   ```

3. Start the development server:

   ```
   npm run dev
   ```

   or

   ```
   yarn dev
   ```

4. Open Figma Desktop app
5. Go to `Plugins > Development > Import plugin from manifest...`
6. Select the `manifest.json` file from this project

### Building for Production

To build the plugin for production:

```
npm run build
```

or

```
yarn build
```

## Usage

1. Select one or more frames in Figma
2. Run the plugin from the Plugins menu
3. Click "Export Selected Frames" to generate SVGs and metadata
4. Edit tags for each icon if needed by clicking "Edit Tags"
5. Click "Download All" to download a ZIP file containing the SVGs and a metadata.json file

## Custom Components

### TagInput Component

The plugin uses a custom TagInput component that allows for intuitive tag entry:

- Type text and press Enter, comma, or space to create a tag
- Click "×" to remove a tag
- Press Backspace when the input is empty to remove the last tag
- Paste comma-separated values to add multiple tags at once
- Select from preset tag categories to quickly add common tags

## Structure

- `src/plugin/code.ts` - The plugin code that interacts with the Figma API
- `src/ui/` - React components for the plugin UI
  - `src/ui/components/TagInput.tsx` - Custom tag input component
  - `src/ui/components/TagEditor.tsx` - Editor for handling tag management
  - `src/ui/components/IconResult.tsx` - Displays individual icon results
  - `src/ui/components/App.tsx` - Main application component
- `dist/` - Built plugin files

## Notes

- This plugin assumes that icon frames are named appropriately, with optional tags in square brackets (e.g., "Icon Name [tag1,tag2]")
- The plugin uses the current page name as the category for the icons
- When exporting, frames are converted to SVG with optimized settings

## License

MIT
