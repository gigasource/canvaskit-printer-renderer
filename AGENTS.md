# D-Level Steering Configuration

## Agent Rules
- Execute tasks fully autonomously until the objective is complete.
- Verify changes using the project's testing harness.
- Adhere strictly to existing coding styles and conventions.
- Make one atomic change per commit when working autonomously.
- If stuck, consult the `.d-level/tuning-log.md` for historical resolutions.

## Architecture & Design Guidelines
- **Separation of Concerns**: Keep generic utilities (e.g. `canvas-txt.js`) and low-level rendering primitives (e.g. `tableCustom`) free of domain-specific table logic. High-level layout and formatting belong in data preparation methods (e.g. `prepareAdvancedTable`).
- **Data Transformation vs Rendering**: Extract pure data preparation logic returning plain objects (`{ colMetaData, rows }`) so text wrapping, line splitting, and padding can be unit-tested without rendering canvas or inspecting images.
- **Input Immutability**: Never mutate caller-provided data arrays or cell objects (e.g. `tableData.data`). Always shallow-clone input data matrices before processing.
- **Font Availability**: Only use fonts explicitly registered in `src/font-families.js` (`Verdana`, `Roboto_Condensed`, `Courier_New`). PureImage silently falls back to the default regular font when an unregistered font is used, causing bold rendering to fail silently.

## Boundaries & Constraints
- Protected paths: `.git/`, `.idea/`, `.DS_Store`
- Avoid making destructive changes to infrastructure or sensitive production paths without explicit confirmation.
