# Advanced Embroidery × PrintFlow — Asset-Preserving 43 Build

This build starts from the previously approved Advanced Embroidery 43 Build and its approved follow-up patches. It is **not a visual redesign**.

## Unchanged
- Homepage and all marketing pages
- Navy / white / red visual system
- Existing typography, spacing, cards and navigation
- Existing Advanced Embroidery logo and real project photography
- Homepage 03 / 1+ / MA / EN markers and alignment
- Service-card spacing and prior rush-policy polish

## Changed / added
- `/order/` is now a three-path order hub: Custom Apparel, Espirito Santo, Custom Quote.
- `/order/quote/` preserves the previously approved guided quote wizard.
- `/order/custom/` embeds Advanced's PrintFlow storefront for T-shirts, polos and hats.
- `/espirito-santo/` preserves the existing layout and product imagery but sends the completed cart to PrintFlow → Square checkout.
- `/assets/js/printflow-config.js` holds only the public PrintFlow origin/slug configuration; no secrets belong in the Advanced repo.

## Required configuration
Set `baseUrl` in `/assets/js/printflow-config.js` to the deployed PrintFlow production origin.

PrintFlow must have:
1. Advanced's Square integration connected.
2. Advanced's SanMar connection configured.
3. The curated T-shirt, polo and hat imported into Advanced's shop catalog.
4. The Espirito Santo storefront seed applied.

## Rush policy
- 10–15 calendar days: $50
- fewer than 10 calendar days: $100

The accompanying PrintFlow patch calculates the school-order rush fee server-side before Square checkout.

## Deployment
Upload this full folder to the existing Advanced repository. Do not add `package-lock.json`.

## Staff admin access
Advanced staff should use `/admin/` on the Advanced website as a private shortcut.
That route redirects to the configured PrintFlow `/login` page. After successful
login, PrintFlow sends the authenticated shop owner to `/dashboard`.

This shortcut is intentionally not exposed in the public navigation.

## Live PrintFlow connection

Advanced is configured to use:

- PrintFlow base URL: `https://printflow-bcjh.vercel.app`
- Advanced shop slug: `advanced-embroidery-screen-printing`
- Advanced customer storefront: `https://printflow-bcjh.vercel.app/s/advanced-embroidery-screen-printing`
- Advanced staff login: `https://printflow-bcjh.vercel.app/login`
- Advanced site private shortcut: `/admin/`

`/order/custom/` now ships its CSS, logo, config, and JavaScript inside the same
folder so Vercel does not need to resolve root `/assets/...` paths for that route.
