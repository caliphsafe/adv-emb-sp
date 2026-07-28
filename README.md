# Advanced Embroidery — 43 Build

Customer-ready static website for GitHub + Vercel. No package-lock.json and no local terminal workflow is required.

## Included

- 16 customer-facing pages plus custom 404 page
- Responsive mobile-first navigation and layout
- Guided custom order form with optional artwork upload
- General contact form
- Espirito Santo uniform quantity form with live estimated total
- Vercel serverless email endpoint using Resend
- LocalBusiness and FAQ structured data
- Sitemap, robots.txt, redirects from the existing Wix URLs and security headers
- Accessibility basics, keyboard navigation and responsive forms

## Deploy with GitHub and Vercel

1. Create a new GitHub repository or replace the files in the existing website repository.
2. Upload every file and folder from this ZIP to the repository root.
3. Do not add package-lock.json. This build does not need one.
4. Import the repository into Vercel. Framework Preset can remain **Other**.
5. Leave Build Command and Output Directory empty.
6. Deploy.

## Activate website forms

The pages work immediately, but form delivery requires a Resend account and three Vercel environment variables.

1. Create or open a Resend account.
2. Verify `advancedembroideryma.com` in Resend.
3. Create an API key.
4. In Vercel open **Project → Settings → Environment Variables**.
5. Add the variables shown in `.env.example`:
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL`
6. Redeploy after saving the variables.

During setup, `onboarding@resend.dev` can be used as the sender for testing. A verified `orders@advancedembroideryma.com` address is recommended for production.

## Important image note

The current company photographs are loaded from the existing Wix media CDN so the new build can use authentic company-owned imagery immediately. Before canceling Wix, download the original high-resolution files and replace the URLs in the HTML with files stored in `assets/images`. The local logo, favicon and design artwork are already included.

## Business details to confirm before domain launch

- Current showroom/pickup hours
- Final payment, deposit, shipping and return policies
- Whether customer-supplied garments are accepted under all circumstances
- Final Espirito Santo product list and current prices
- Any active social media profile URLs
- Preferred website inbox and branded sender email

## Editing

- Global styles: `assets/css/styles.css`
- Global interactions and form logic: `assets/js/site.js`
- Form email delivery: `api/contact.js`
- Redirects and security headers: `vercel.json`
- Each page has its own `index.html` inside its named folder.
