# Advanced Embroidery Rush Policy Patch

Upload the contents of this patch to the root of the existing GitHub repository and allow the files to replace the matching files.

## Updated policy

- Orders needed 10–15 calendar days from the request date: $50 rush charge.
- Orders needed in fewer than 10 calendar days: $100 rush charge.
- Rush work remains subject to product availability and production capacity.

## Updated files

- assets/js/site.js
- assets/css/styles.css
- order/index.html
- espirito-santo/index.html
- services/index.html
- embroidery/index.html
- screen-printing/index.html
- dtf-printing/index.html
- how-it-works/index.html
- faq/index.html
- terms/index.html

## Form behavior

The date-needed field now calculates the applicable rush window automatically. The customer sees a quiet contextual message under the date field, and the submitted email includes both `rushCharge` and `rushWindow` values for the team.

The uniform merchandise total does not automatically add the rush charge. The applicable fee is clearly noted and should be confirmed before finalizing the order.

No new Vercel environment variables are required. Existing Gmail form settings remain unchanged.
