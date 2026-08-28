# Advanced Custom Order Page — Definitive CSS Fix

This patch intentionally makes `/order/custom/` self-contained.

## Replace
- `order/custom/index.html`
- `vercel.json`

## Why this fixes the problem
The custom page no longer loads:
- `/assets/css/styles.css`
- `./styles.css`
- external Advanced logo assets
- external Advanced JavaScript
- external PrintFlow config JavaScript

The approved Advanced site stylesheet is embedded directly inside `index.html`.
The Advanced logo is embedded directly as a data URI.
The PrintFlow production URL and shop route are embedded directly.
The mobile navigation and iframe boot code are embedded directly.

The only external resource required by the page is the actual PrintFlow iframe:
`https://printflow-bcjh.vercel.app/s/advanced-embroidery-screen-printing`

`vercel.json` also disables caching specifically on `/order/custom/` while this
route is being stabilized, preventing an old static HTML version from surviving
a deployment.

No SQL changes are required.
No PrintFlow changes are required.
No Square or SanMar reconnection is required.
