# AUREVANT — Luxury Estates & Residences

A recreation and remix-ready implementation of the [AUREVANT](https://aurevant.framer.website/) Framer template. Built with semantic HTML5, high-performance Vanilla CSS, and modern JavaScript.

## Features

- **Dark Architectural Aesthetics**: Custom color tokens, glassmorphic floating navigation with live NYC time clock, deep dark backgrounds (`#0b0b0b`), and clean typography powered by Google Fonts (`Manrope`).
- **Interactive Property Collection**: 6 luxury properties with real-time category filtering (Contemporary Homes, Private Estates, Waterfront Living, Investment Properties).
- **Interactive Gallery Carousel**: Multi-slide luxury villa imagery with progress indicators and responsive touch/click navigation.
- **Dynamic Services Accordion**: Multi-tab expandable services breakdown (`Buying`, `Selling`, `Advisory`, `Investment`).
- **Animated Metrics & Micro-Interactions**: Scroll-triggered experience stats counter and smooth scroll-to-top.
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices with a dedicated mobile drawer menu.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Local Server
```bash
npm start
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### 3. Run Playwright Automated Tests
```bash
npm test
```
Or run the full build verification suite:
```bash
node verify-build.js
```

## Project Structure

```
├── index.html            # Main markup with all sections and metadata
├── index.css             # Vanilla CSS design system & responsive styling
├── main.js               # Client-side interactions (clock, slider, filtering, accordion)
├── server.js             # Lightweight local HTTP server
├── test-browser.js       # Playwright browser integration test
├── verify-build.js       # End-to-end template verification script
├── package.json          # Project configuration & scripts
└── .gitignore            # Ignored files (node_modules, logs)
```
