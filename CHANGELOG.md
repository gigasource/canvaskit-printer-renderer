# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.92] - 2026-10-12

### Added
- **Cell-level `paddingLeft`**: Added support for `paddingLeft` (space count) directly on cell objects, allowing item modifiers to maintain consistent multi-line indentation across word-wrapped lines.
- **Pure Data Transformation (`prepareAdvancedTable`)**: Extracted layout and line-splitting logic into `prepareAdvancedTable(tableData, autoAdjustWidth)` returning `{ colMetaData, rows }`. This enables deterministic, sub-second unit testing without rendering canvas or inspecting PNG images.

### Changed
- **Direct Column Auto-Adjustment**: Replaced the legacy 20-step brute-force loop and recursive backtracking algorithm with a direct, single-pass calculation. Flexible columns now cleanly divide all remaining width (`1 - totalPadding - totalHighWidth`).
- Refactored `advancedTableCustom` to act as a lightweight rendering wrapper over `prepareAdvancedTable`.
- Updated test suite in `test/advancedTableCustom.test.js` to assert data structure outputs and use `Roboto_Condensed` with working bold fonts.

### Fixed
- **Auto-Width Column Distortion**: Fixed an issue where rounding remainders from 5% discrete step increments were erroneously dumped into the last column (`colMetaData[w - 1]`, typically a HIGH priority Sum column), distorting column alignments.
- **Safe Cell Text Normalization**: Added null/undefined guards before trimming text in `autoAdjustWidth` to avoid runtime exceptions on sparse cell matrices.
- **Input Immutability**: Shallow-cloned caller input data matrices in `prepareAdvancedTable` to avoid mutating caller `tableData.data` objects in-place.
- **Bold Font Fallback**: Clarified registered font requirement (`src/font-families.js`) to prevent silent fallbacks to regular weight fonts.

## [0.0.91] - 2026-10-12

### Changed
- Release v0.0.91 package configuration.

## [0.0.90] - 2026-10-12

### Changed
- Release v0.0.90 package configuration.

## [0.0.89] - 2026-10-12

### Changed
- Dependency and release updates.

## [0.0.88] - 2026-02-21

### Fixed
- Fix text printing and paragraph rendering calculations.

## [0.0.87] - 2026-02-21

### Added
- Registered `Courier_New` font family (Regular, Bold, Italic, Bold Italic).

## [0.0.86] - 2025-12-17

### Changed
- Removed deprecated `NotoSansSC` font assets from font registry.
