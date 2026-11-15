# Studio Stay – 3D Interactive Design Studio

An interactive 3D studio apartment design application built with **React**, **TypeScript**, and **Three.js** (bundled with **Vite**).

This project reimagines an interior design presentation board as a dynamic 3D experience with customizable furniture finishes, lighting presets (Morning Sun / Evening), textile palettes, camera transitions, and interactive placement & shopping lists. It faithfully preserves both **Layout B** and **Layout A**, allowing seamless real-time switching between concepts.

---

## 🏗 Project Architecture & Config Extraction

All colors, dimensions, camera presets, material definitions, furniture placements, shopping specifications, and constant values have been extracted into dedicated TypeScript configuration files inside [`src/config/`](file:///Users/abhay/Documents/Workspace/backup_HomeStudio/src/config):

```
src/
├── config/
│   ├── types.ts            # Complete TypeScript interfaces for all data structures
│   ├── theme.json          # UI color tokens (light & dark mode), typography & labels
│   ├── finishes.json       # 21 furniture finish presets (hex, grain RGB, amount)
│   ├── palettes.json       # Textile color palettes (Terracotta, Sage & sand, Indigo)
│   ├── lighting.json       # Lighting configurations (Day / Evening intensities & vectors)
│   ├── materials.json      # 3D material specs (roughness, metalness, colors)
│   ├── roomGeometry.json   # Room shell dimensions and boundaries
│   ├── layouts/
│   │   ├── layoutB.json    # Layout B placements, shopping list, views, labels
│   │   └── layoutA.json    # Layout A placements, shopping list, views, labels
│   └── index.ts            # Unified barrel export
├── 3d/
│   ├── textureGenerator.ts # Procedural canvas textures (wood grain, tiles, granite, rug, art)
│   └── StudioScene.ts      # Three.js scene, lighting, materials, and camera engine
├── components/
│   ├── Navbar.tsx          # Sticky navigation with instant Layout A/B switcher
│   ├── HeaderBanner.tsx    # Dynamic header title and concept description
│   ├── StudioCanvas.tsx    # 3D viewport, fullscreen mode, 3D label projection
│   ├── ControlsBar.tsx     # Camera chips, textile palettes, lighting, captions, finish swatches
│   ├── PlacementTable.tsx  # Responsive "Where your things go" table
│   ├── ShoppingListTable.tsx # Spec and budget calculation table (₹ INR)
│   ├── Assumptions.tsx     # Design notes and architectural assumptions
│   └── Footer.tsx          # Project footer
├── App.tsx                 # Root application state and layout
├── main.tsx                # React 19 entry point
└── index.css               # Responsive design tokens and styling
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v20+)
- npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` in your browser.

### Production Build
```bash
npm run build
```
Type checks via `tsc` and bundles optimized production assets into `dist/`.

### Preview Build Locally
```bash
npm run preview
```

---

## ⌨️ Controls & Shortcuts
- **Orbit**: Left-click and drag
- **Pan**: Right-click and drag (or two-finger drag)
- **Zoom**: Scroll wheel or pinch
- **Toggle Captions**: Press <kbd>C</kbd>
- **Exit Fullscreen**: Press <kbd>Esc</kbd>

---

## 📤 Publishing to GitHub

1. Stage and commit your files:
   ```bash
   git add .
   git commit -m "Migrate Studio Stay 3D website to React + TypeScript with modular configs"
   ```

2. Create a new repository on your GitHub account (e.g. `studio-stay-3d` or `HomeStudio`).

3. Link your remote and push:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
   git branch -M main
   git push -u origin main
   ```

4. *(Optional)* Deploy to **GitHub Pages**:
   - Add `"base": "./"` in `vite.config.ts`.
   - Run `npm run build` and deploy `dist` using `gh-pages` or GitHub Actions.
