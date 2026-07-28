# Advanced Embroidery Gmail + Logo Patch

This patch removes Resend and FormSubmit. The forms post to the website's own `/api/contact` Vercel Function, which signs in to the listed Gmail account through Gmail SMTP using a Google App Password.

## Replace/add these files

Upload the full contents of this patch to the repository, preserving the folders. Choose **Commit changes** after uploading.

Important files:

- `api/contact.js`
- `assets/js/site.js`
- `assets/css/styles.css`
- `assets/logo/logo.png`
- `package.json`
- `.env.example` is an example only and does not contain the real password.
- All included HTML files replace the inline generated logo with `/assets/logo/logo.png`.

Delete the previous FormSubmit `thank-you` page only if you do not want to keep it. It is no longer used by the AJAX forms.

## Logo

The website now reads the header and footer logo from:

`assets/logo/logo.png`

A working PNG version of the current generated mark is included so the site will not show a broken image. Replace that exact file later with the client's actual `logo.png`. Keep the filename and folder unchanged. A wide transparent PNG is recommended.

## Vercel Environment Variables

Add:

- `GMAIL_USER` = `mpimentel1363@gmail.com`
- `GMAIL_APP_PASSWORD` = the 16-character Google App Password, entered without spaces
- `CONTACT_TO_EMAIL` = `mpimentel1363@gmail.com`

Do not use the normal Gmail password.

After adding or changing variables, redeploy the website. Environment-variable changes only apply to a new deployment.

## Google setup

1. Sign in to the Google account for `mpimentel1363@gmail.com`.
2. Open Google Account > Security.
3. Turn on 2-Step Verification.
4. Search the Google Account settings for **App passwords**.
5. Create an app password named `Advanced Embroidery Website`.
6. Copy the 16-character password and save it as `GMAIL_APP_PASSWORD` in Vercel.

## Test

After Vercel finishes redeploying, submit the Contact form, Custom Order form, and Espirito Santo form. Confirm each arrives at `mpimentel1363@gmail.com`. Test one small artwork attachment as well. Pressing Reply on a submission will address the customer's email because the function sets Reply-To.

## Deployment note

This patch intentionally includes no `package-lock.json`. Vercel will install Nodemailer from `package.json` during deployment.
