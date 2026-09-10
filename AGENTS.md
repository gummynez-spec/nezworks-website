# NezWorks Workspace

## Workflow Rules

- **After every change**: commit and push to `origin/main` (repo: gummynez-spec/nezworks-website).
  - Remote already configured — token-less URL; push will use the credential helper or a fresh token if needed.
  - Stage only intended files; never commit `.DS_Store` or secrets.
- The site lives in `NezWorks website/` (repo root is the parent).

## Project

- Single-page site: `index.html`, `css/` (base, animations, components), `js/` (12 modules), `assets/nezworks-logo.svg`.
- Design system: Minimal UI + Glassmorphism + Cosmic Atmosphere. The ORBIT is the signature motif.
- Respect `prefers-reduced-motion` and keep animations GPU-friendly (transform/opacity/filter).
- Verify changes with `node --check js/*.js` and serve via `python3 -m http.server 4173`.
