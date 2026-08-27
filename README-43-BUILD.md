# Advanced Embroidery & Screen Printing — 43 Build

## What this build does
- Preserves the Advanced brand/service story while replacing the confusing SanMar-number workflow.
- Adds one Order hub with two paths: Custom Apparel and Espirito Santo School Uniforms.
- Custom Apparel embeds the Advanced PrintFlow shop (`advanced-embroidery-screen-printing`).
- Uniform ordering can load its live catalog from PrintFlow and starts Square checkout through PrintFlow.
- Includes the currently visible Espirito Santo items/prices as a graceful local fallback.
- Includes mobile-first responsive UI, schema, sitemap, robots, canonical metadata, local-business entity data, FAQ/AEO content, and legacy URL redirects.

## Required launch configuration
Open `assets/js/config.js` and set `printflowBaseUrl` to the production PrintFlow origin. Example:
```js
printflowBaseUrl: "https://YOUR-PRINTFLOW-DOMAIN.com"
```
Do not add API keys to this file. Square and SanMar credentials belong only in PrintFlow's encrypted server-side integrations.

## PrintFlow shop
- Shop slug: `advanced-embroidery-screen-printing`
- Custom route: `/s/advanced-embroidery-screen-printing`
- Uniform storefront slug: `espirito-santo`

## Customer-facing catalog scope
Custom instant order: T-shirts, polos, hats only.
Other items route to contact/custom review.

## Espirito Santo recovered catalog
The existing Wix form visibly exposes:
- Port Authority Y500 short-sleeve red youth polo — $23
- Port Authority K500 short-sleeve red adult polo — $25
- Port Authority Y500LS long-sleeve red youth polo — $27
- Port Authority K500LS long-sleeve red adult polo — $29
- Jerzees 29B navy youth tee — visible size fields at $14
- Jerzees 29M navy adult tee — visible size fields at $16

The old Wix form is multi-step; any additional hidden-step products should be added to the PrintFlow storefront catalog before final cutover.

## Rush policy
- 15–10 days: $50
- Under 10 days: $100
Rush eligibility still depends on production capacity.

## Deployment
Upload all files to the Advanced website repository or a new GitHub repository connected to Vercel. No package-lock is included or required.
