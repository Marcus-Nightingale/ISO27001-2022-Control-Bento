# ISO27001:2022 - Control Bento

A bento-style, practitioner-focused reference for ISO/IEC 27001:2022 Annex A controls. The UI groups all 93 controls by control type, supports fast search and filtering, and provides a modal detail view sourced from `controls.json`.

## What The Page Includes

- Bento layout with hero, search, summary, grouped controls, and footer cards.
- All 93 Annex A controls, grouped by control type: Organizational, People, Physical, Technological.
- Search that filters by control ID, title, summary, and all detailed fields.
- Section headers that toggle (show/hide) the controls within each group.
- Card-based control list (4 per row on desktop, responsive on smaller screens).
- Control modal with:
  - Overview
  - Core points
  - In practice
  - Evidence examples
- Keyboard and accessibility support:
  - Skip link to controls
  - Focus-visible styles
  - Modal focus trapping and Escape-to-close
  - `aria-hidden` / `inert` for background when modal is open

## Data Source

All control content is loaded from `controls.json`.

Each control entry includes:

- `title`
- `type` (organizational, people, physical, technological)
- `overview`
- `core_points`
- `in_practice`
- `evidence_examples`
- `desc`
- `summary`
- `isms` (link)
- `hightable` (link)

The page fetches `controls.json` at runtime, renders the control grid, and uses the same data for the modal details.
