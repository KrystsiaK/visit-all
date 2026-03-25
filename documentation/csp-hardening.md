# CSP Hardening

## Goal

Add a practical production CSP and HSTS baseline without breaking the current map stack, widget assets, and Next.js runtime.

## Current allowlist

The application currently needs external access for:

1. Carto basemap styles and glyphs
2. ArcGIS satellite raster tiles
3. AWS terrain tiles source
4. Unsplash demo images
5. Figma-hosted demo widget assets

## Current strategy

1. deny framing via `frame-ancestors 'none'`
2. deny plugins via `object-src 'none'`
3. restrict base/form actions to self
4. allow images only from known current sources plus `self`, `data:`, `blob:`
5. allow map/style/font/connect sources only from known required providers
6. keep `style-src 'unsafe-inline'` for current UI stack compatibility
7. keep `script-src 'unsafe-inline'` to avoid breaking Next runtime bootstrap

## TEMP / Tech Debt

1. CSP is intentionally pragmatic, not maximal
2. external demo assets from Unsplash and Figma should be removed or self-hosted later
3. if/when we add a nonce-based script strategy, CSP can be tightened further
