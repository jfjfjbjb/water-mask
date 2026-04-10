# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite watermark camera application. Users upload images, add/edit watermark text overlays, and download the final image with watermark baked in.

## Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

**Two-column layout** in `src/App.tsx`:
- **Left column (Col span=8)**: File upload area using Ant Design `Dragger` with `Image.PreviewGroup` for multi-image support
- **Right column (Col span=16)**: Preview/edit area showing selected image with watermark overlay

**Key components**:
- `ModifyItem` (`src/components/ModifyItem/Index.tsx`): Renders image with `contentEditable` watermark overlay. The outer div is passed as a `ref` to `snapdom.download()` for capture. Watermark includes time, date, location, and branding text styled with `text-shadow`.
- `AsyncImage` (`src/components/AsyncImage/Index.tsx`): Loads image preview asynchronously with 500ms delay using `FileReader` and `useDeferredValue`.

**State management**:
- `modifyItem`: Currently selected file and its object URL
- `scale`: Watermark zoom level (0.2-2.5), applied via inline `style` scaling

**Download mechanism**: Uses `@zumer/snapdom` library (`snapdom.download()`) to capture the `ref` element containing the image and watermark overlay as a single JPG file.

**Styling**: Less files with CSS nesting (`src/App.less`). Custom scrollbar styles for webkit browsers. Gradients used for section icons (green for upload, orange for preview).

## Tech Stack

- React 19, TypeScript 5.9
- Vite (rolldown-vite) for bundling
- Ant Design 6 for UI components
- Less for styling
- ESLint with typescript-eslint
