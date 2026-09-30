# Changelog

All notable changes to this project are documented here.

## 1.0.0 — 2026-09-30

- Promote the existing anchored positioning API to a stable release with React
  18.3 and React 19 consumer verification.
- Preserve React 19 callback-ref cleanup and keep refs attached through ordinary
  renders. Reject fragments as `asChild` anchors.
- Preserve anchor direction across portals for correct RTL alignment and
  transform origins, including content narrower than its anchor.
- Use the SSR-safe layout effect for content bookkeeping.
- Validate installed declarations, module formats, open-root server rendering,
  and CSS exports against both supported React versions.
- Stage retained package bytes through trusted publishing before approval and
  verify current main, exact version, integrity, and package contents.
- Update the stable documentation, security support policy, and transitive
  development dependency `brace-expansion` to its patched version.

## 0.1.0-alpha.0

- Add controlled and uncontrolled anchored-layer roots.
- Add dependency-free `asChild` anchor composition for React 18.3 and React 19.
- Add scoped, SSR-safe body and custom-container portals.
- Add offset, flip, shift, sizing variables, width matching, and first-position
  visibility through Floating UI.
- Add ESM, CommonJS, TypeScript, CSS, packed-consumer, bundle-budget, and release
  verification.
- Add Chromium, Firefox, and WebKit geometry coverage.
- Add the dedicated documentation website and address-search stress example.
