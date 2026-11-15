# Studio Stay – 3D Interactive Design Studio

An interactive 3D studio apartment styling and layout web application built with **React**, **TypeScript**, and **Three.js** (bundled with **Vite**).

This project reimagines an interior design presentation board as a dynamic 3D experience with customizable furniture finishes, lighting presets (Morning Sun / Evening), textile palettes, camera transitions, and interactive placement & shopping lists. It faithfully preserves both **Layout B** and **Layout A**, allowing seamless real-time switching between concepts.

---

## 📑 Table of Contents
1. [Features](#-features)
2. [Project Architecture & JSON Configs](#-project-architecture--json-configs)
3. [Prerequisites](#-prerequisites)
4. [Setup & Installation](#-setup--installation)
5. [Running in Development](#-running-in-development)
6. [Building for Production](#-building-for-production)
7. [Previewing the Production Build](#-previewing-the-production-build)
8. [Publishing to Your GitHub Account](#-publishing-to-your-github-account)
9. [Deployment Options](#-deployment-options)
   - [Option A: GitHub Pages (Automatic with GitHub Actions)](#option-a-github-pages-automatic-with-github-actions)
   - [Option B: Vercel](#option-b-vercel)
   - [Option C: Netlify](#option-c-netlify)
   - [Option D: Cloudflare Pages](#option-d-cloudflare-pages)
10. [Customizing via JSON Configs](#-customizing-via-json-configs)
11. [Controls & Shortcuts](#-controls--shortcuts)

---

## ✨ Features

- **Interactive 3D Room**: Built to scale from floor plan measurements (3.66 m × 3.60 m room, pantry, balcony, bathroom block).
- **Dual Layout Switching**: Real-time toggle between **Layout B** (bed on left wall, TV & fridge unit facing it) and **Layout A** (bed facing pantry, TV on bathroom wall).
- **21 Furniture Finishes**: Wood grains (Walnut, Oak, Teak, Wenge) and matte laminates (White, Sage, Forest, Terracotta, Navy, Mustard, Charcoal, etc.).
- **3 Textile Palettes**: Terracotta, Sage & sand, Indigo with synchronized throws, cushions, curtains, and rugs.
- **Day / Evening Lighting**: Toggle between bright morning sunlight with realistic soft shadows and warm evening ambient light.
- **Dynamic 3D Labels**: Category-filterable label pins (`Your items`, `Add-ons`, `Room`) projected in real-time over 3D coordinates.
- **Shopping Budget Calculator**: Auto-calculates low-end and high-end budget ranges in Indian Rupees (`₹`).
- **100% Config-Driven**: All colors, dimensions, labels, and furniture specs live in standalone `.json` files.

---

## 🏗 Project Architecture & JSON Configs

All constants, colors, material definitions, furniture placements, shopping specifications, and camera presets have been extracted into dedicated `.json` configuration files inside [`src/config/`](file:///Users/abhay/Documents/Workspace/backup_HomeStudio/src/config):

```
backup_HomeStudio/
├── .github/
│   └── workflows/
│       └── deploy.yml      # Automated GitHub Pages CI/CD workflow
├── src/
│   ├── config/
│   │   ├── types.ts            # Strict TypeScript interfaces for all data structures
│   │   ├── theme.json          # UI color tokens (light & dark mode), typography & labels
│   │   ├── finishes.json       # 21 furniture finish presets (hex, grain RGB, amount)
│   │   ├── palettes.json       # Textile color palettes (Terracotta, Sage & sand, Indigo)
│   │   ├── lighting.json       # Lighting configurations (Day / Evening intensities & vectors)
│   │   ├── materials.json      # 3D material specs (roughness, metalness, colors)
│   │   ├── roomGeometry.json   # Room shell dimensions and boundaries
│   │   ├── layouts/
│   │   │   ├── layoutB.json    # Layout B placements, shopping list, views, labels
│   │   │   └── layoutA.json    # Layout A placements, shopping list, views, labels
│   │   └── index.ts            # Unified barrel export
│   ├── 3d/
│   │   ├── textureGenerator.ts # Procedural canvas textures (wood grain, tiles, granite, rug, art)
│   │   └── StudioScene.ts      # Three.js scene, lighting, materials, and camera engine
│   ├── components/
│   │   ├── Navbar.tsx          # Sticky navigation with instant Layout A/B switcher
│   │   ├── HeaderBanner.tsx    # Dynamic header title and concept description
│   │   ├── StudioCanvas.tsx    # 3D viewport, fullscreen mode, 3D label projection
│   │   ├── ControlsBar.tsx     # Camera chips, textile palettes, lighting, captions, finish swatches
│   │   ├── PlacementTable.tsx  # Responsive "Where your things go" table
│   │   ├── ShoppingListTable.tsx # Spec and budget calculation table (₹ INR)
│   │   ├── Assumptions.tsx     # Design notes and architectural assumptions
│   │   └── Footer.tsx          # Project footer
│   ├── App.tsx                 # Root application state and layout
│   ├── main.tsx                # React 19 entry point
│   └── index.css               # Responsive design tokens and styling
├── index.html                  # HTML shell with Google Fonts Outfit & Inter
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite configuration (with relative base './' for static hosting)
└── README.md                   # Complete documentation
```

---

## 📦 Prerequisites

Before running the project, make sure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (tested with `v20+` and `v26`)
- **npm**: `v9.0.0` or higher (comes bundled with Node.js)
- **Git**: installed and configured

Verify by running:
```bash
node -v
npm -v
git --version
```

---

## 🛠 Setup & Installation

1. **Navigate to the project directory** (or clone the repository if pulling from GitHub):
   ```bash
   cd backup_HomeStudio
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

---

## 💻 Running in Development

To start the local development server with hot-module replacement (HMR):

```bash
npm run dev
```

The terminal will display the local URL:
```text
  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Open `http://localhost:3000` in your browser. Any edits made to `.json` configs or components will update instantly.

---

## 🏗 Building for Production

To create an optimized, minified, and type-checked production bundle:

```bash
npm run build
```

This command runs `tsc` (TypeScript compiler) followed by `vite build`. The compiled static files will be placed in the [`dist/`](file:///Users/abhay/Documents/Workspace/backup_HomeStudio/dist) directory:

```text
dist/
├── index.html
└── assets/
    ├── index-[hash].css
    └── index-[hash].js
```

All asset references are built with relative paths (`./`), making `dist/` ready for hosting on GitHub Pages, Vercel, Netlify, or any static HTTP server.

---

## 🔍 Previewing the Production Build

To test the exact production output locally before deploying:

```bash
npm run preview
```

Open the preview URL provided in the terminal (typically `http://localhost:3000` or `http://localhost:4173`).

---

## 📤 Publishing to Your GitHub Account

1. **Verify your local git status**:
   ```bash
   git status
   ```

2. **Stage and commit any changes** (if not already committed):
   ```bash
   git add .
   git commit -m "feat: complete React TS 3D Studio Stay app with JSON configs"
   ```

3. **Create a new repository on GitHub**:
   - Go to [github.com/new](https://github.com/new).
   - Enter a repository name (e.g., `studio-stay-3d` or `HomeStudio`).
   - Set visibility to **Public** or **Private** (leave "Initialize this repository with a README" unchecked).
   - Click **Create repository**.

4. **Link the remote and push**:
   ```bash
   # Replace <YOUR_GITHUB_USERNAME> and <YOUR_REPOSITORY_NAME> with your details:
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
   git branch -M main
   git push -u origin main
   ```

---

## 🚀 Deployment Options

### Option A: GitHub Pages (Automatic with GitHub Actions)

An automated deployment workflow is already included at [`.github/workflows/deploy.yml`](file:///Users/abhay/Documents/Workspace/backup_HomeStudio/.github/workflows/deploy.yml).

1. Push your code to GitHub:
   ```bash
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Every time you push to `main`, GitHub Actions will automatically build and publish your site at:
   `https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPOSITORY_NAME>/`

---

### Option B: Vercel

#### Method 1: Via Vercel Web Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New Project** → **Import** your repository.
3. Vercel automatically detects Vite:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Your site is live in under 60 seconds with a free `.vercel.app` URL.

#### Method 2: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

---

### Option C: Netlify

#### Method 1: Netlify Drop (Zero Configuration)
1. Run `npm run build` locally.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag and drop the `dist` folder directly onto the browser window. Your site is live immediately.

#### Method 2: Via Netlify Git Integration
1. Go to [netlify.com](https://www.netlify.com) and sign in.
2. Click **Add new site** → **Import an existing project** → **GitHub**.
3. Select your repository:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Click **Deploy site**.

---

### Option D: Cloudflare Pages

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Workers & Pages**.
2. Click **Create Application** → **Pages** → **Connect to Git**.
3. Select your repository:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**.

---

## 🎨 Customizing via JSON Configs

Everything in the application is managed through the JSON files in [`src/config/`](file:///Users/abhay/Documents/Workspace/backup_HomeStudio/src/config):

| To customize... | Edit this file |
| :--- | :--- |
| **Theme & UI colors** | [`src/config/theme.json`](file:///Users/abhay/Documents/Workspace/backup_HomeStudio/src/config/theme.json) |
| **Furniture finishes & wood grains** | [`src/config/finishes.json`](file:///Users/abhay/Documents/Workspace/backup_HomeStudio/src/config/finishes.json) |
| **Textile color palettes** | [`src/config/palettes.json`](file:///Users/abhay/Documents/Workspace/backup_HomeStudio/src/config/palettes.json) |
| **Sunlight & evening lighting** | [`src/config/lighting.json`](file:///Users/abhay/Documents/Workspace/backup_HomeStudio/src/config/lighting.json) |
| **3D materials & textures** | [`src/config/materials.json`](file:///Users/abhay/Documents/Workspace/backup_HomeStudio/src/config/materials.json) |
| **Room dimensions & boundaries** | [`src/config/roomGeometry.json`](file:///Users/abhay/Documents/Workspace/backup_HomeStudio/src/config/roomGeometry.json) |
| **Layout B specs, shopping items, views & labels** | [`src/config/layouts/layoutB.json`](file:///Users/abhay/Documents/Workspace/backup_HomeStudio/src/config/layouts/layoutB.json) |
| **Layout A specs, shopping items, views & labels** | [`src/config/layouts/layoutA.json`](file:///Users/abhay/Documents/Workspace/backup_HomeStudio/src/config/layouts/layoutA.json) |

---

## ⌨️ Controls & Shortcuts

| Action | Control |
| :--- | :--- |
| **Orbit camera** | Left-click and drag / Single-finger touch and drag |
| **Pan camera** | Right-click and drag / Two-finger touch drag |
| **Zoom in / out** | Mouse scroll wheel / Pinch gesture |
| **Toggle Captions** | Press <kbd>C</kbd> or click the "Captions" button |
| **Exit Fullscreen** | Press <kbd>Esc</kbd> or click the "Close" button |
| **Switch Layout** | Click the "Switch to Layout A / B" button in the top navigation |
