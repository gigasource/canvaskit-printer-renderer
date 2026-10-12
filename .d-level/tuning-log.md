# Agent Tuning Log

This file tracks recurring agent failures, edge cases, and permanent fixes to prevent regressions in autonomous workflows.

## Format
- **Date**: YYYY-MM-DD
- **Incident**: Description of the failure or friction.
- **Root Cause**: Why did the agent fail?
- **Resolution**: Rule added to `AGENTS.md` or harness change made.

---

### [2026-10-12] Table Layout Architecture & Testability Separation
- **Context**: Added cell-level `paddingLeft` with space counts, fixed bold text in tables, and extracted `prepareAdvancedTable`.
- **Friction**:
  1. Agent initially proposed leaking `paddingLeft` into generic `canvas-txt.js`, then into low-level `tableCustom`, violating separation of concerns.
  2. Data processing was coupled to canvas rendering, requiring slow visual PNG inspection instead of fast data assertions.
  3. `data` matrix was mutated in-place by `trimEnd()`.
  4. Unregistered font `NotoSansSCVF` silently fell back to regular `Verdana`, making bold rendering fail without warnings.
- **Root Cause**: Architecture boundaries between data transformation and canvas rendering were implicit rather than documented in steering files.
- **Resolution**:
  1. Extracted `prepareAdvancedTable` as a pure data method returning `{ colMetaData, rows }`.
  2. Documented Architecture & Design Guidelines in `AGENTS.md` covering Separation of Concerns, Data vs Render separation, Input Immutability, and Font Availability.
