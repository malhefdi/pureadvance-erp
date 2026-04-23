# Pure Advance ERP — Offline Setup

## Requirements
- **Node.js 18+** — download from https://nodejs.org (LTS version)

## Quick Start

1. **Double-click `start.bat`** — it handles everything:
   - Installs dependencies (first time only, ~2-3 min)
   - Builds the app (first time only, ~1-2 min)
   - Starts the server

2. **Open http://localhost:3000** in your browser

3. **Install as app** (optional):
   - Chrome: ⋮ → "Install Pure Advance ERP" or "Create shortcut" → "Open as window"
   - Edge: ⋯ → "Apps" → "Install this site as an app"

## Pages
| URL | Feature |
|-----|---------|
| `/` | Dashboard |
| `/factory` | Interactive factory floor plan |
| `/pid` | P&ID Engineering (ISA-5.1) |
| `/process` | Process flow (ISA-88) |
| `/batches` | Batch tracking |
| `/equipment` | Equipment list |
| `/qc` | Quality control |
| `/bom` | BOM & Materials |
| `/bioprocess` | Bioprocess engineering tools |

## PWA / Offline
- The app works offline after first load (service worker caches everything)
- To test: load the app, then disconnect internet — pages still work
- Install prompt appears after 3 seconds on first visit

## Troubleshooting
- **Port 3000 in use**: Edit `package.json` → change `"start": "next start"` to `"start": "next start -p 3001"`
- **Build fails**: Delete `node_modules` and `.next` folders, run `start.bat` again
- **Blank page**: Hard refresh (Ctrl+Shift+R) or clear browser cache
