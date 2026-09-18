# ISO27001:2022 - Control Bento

Practitioner-focused reference for ISO/IEC 27001:2022 Annex A controls.
Currently being rebuilt from scratch — page coming soon.

## Data Source

All 93 Annex A control entries live in `controls.json` (canonical) with a
generated `window.CONTROL_DATA` snapshot in `controls-data.js` for `file://`
use (fetch is blocked on local files; over HTTP `controls.json` is the live
source).

After editing `controls.json`, regenerate the snapshot:

```bash
python3 -c "import json; open('controls-data.js','w').write('window.CONTROL_DATA = ' + json.dumps(json.load(open('controls.json')), ensure_ascii=False) + ';')"
```

Each control entry includes `title`, `type` (organizational, people, physical,
technological), `overview`, `core_points`, `in_practice`, `evidence_examples`,
`desc`, `summary`, `isms` and `hightable` links.
