# AllPencils — MVP Definition

> What must work, for whom, and to what standard, before this is considered demo-ready.

---

## 1. Who This Demo Is For

**Primary audience:** One prospective client, evaluating whether to pay for a custom ecommerce storefront.

**What they need to believe after the demo:**

- The store looks professional and trustworthy.
- It is fast — noticeably faster than a generic Shopify theme.
- It has smart features (AI recommendations, assistant) their current setup does not.
- They could manage it themselves once handed over.

---

## 2. The Core Loop

This is the exact sequence a visitor follows, start to finish. Every step must work without error for the demo to succeed.

1. Land on the **Homepage** — hero section, featured products, "AI picks" recommendation strip.
2. Browse the **Product Catalogue** — category filter, product grid, product cards with image, name, and price.
3. Open a **Product Detail Page** — full image, description, price, variant selector (if applicable), Add to Cart button, and a "You might also like" recommendation row.
4. View the **Cart** — items listed with quantities, subtotal, and a Proceed to Checkout button.
5. Complete a **Simulated Checkout** — name, email, address fields, test card entry, and a confirmation screen with order number.
6. Interact with the **Shopping Assistant** — open the chat widget, ask a pre-scripted question, receive a relevant canned response.

---

## 3. Acceptance Criteria (What Must Work Flawlessly)

### Homepage

- Hero section renders with headline, subheadline, and a CTA button linking to the catalogue.
- Featured products section shows at least 4 products pulled from Medusa.
- "AI Picks" strip shows 3–4 products with a label indicating they are recommended.

### Product Catalogue

- All seeded products are displayed in a grid.
- Clicking any product navigates to its detail page.
- The page loads in under 2 seconds on a standard connection (ISR-served).

### Product Detail Page

- Product image, title, price, and description are all present.
- Add to Cart button adds the item to the cart and shows a visual confirmation (toast or badge update).
- "You might also like" row shows at least 2 related products.

### Cart

- Cart accurately reflects all added items and quantities.
- Quantities can be adjusted or items removed.
- Subtotal updates correctly.

### Simulated Checkout

- Form accepts input without errors.
- Stripe test card (`4242 4242 4242 4242`) is accepted.
- A confirmation screen appears with a mock order number.
- No real charge is made.

### Shopping Assistant

- Widget opens and closes without error.
- At least 5 distinct pre-scripted questions and answers are reachable.
- The assistant does not error on unexpected input — it falls back to a default response.

### Performance

- Lighthouse / PageSpeed score of **90 or above** on mobile for the Homepage and at least one Product Detail Page.
- All images load via `next/image` with no layout shift (CLS = 0).

---

## 4. Explicitly NOT Required for the MVP

The following will not be built and should not be mentioned as missing during the demo:

- User accounts, login, or order history
- Real payment processing
- Email confirmation on order
- Admin panel walkthrough (can be shown briefly if asked, but not part of the demo flow)
- Search functionality
- Discount codes
- Mobile-specific layout tweaks beyond Tailwind's responsive defaults
- Any real AI API calls

---

## 5. Demo Readiness Checklist

- [ ] All 6 core loop steps complete without error
- [ ] Under 10 products seeded in Medusa with images, descriptions, and prices
- [ ] Simulated checkout completes with test card and shows confirmation screen
- [ ] Shopping assistant widget functional with ≥5 scripted exchanges
- [ ] "AI Picks" recommendation strip visible on homepage and product detail pages
- [ ] Lighthouse mobile score ≥ 90 on homepage
- [ ] All images using `next/image` — zero raw `<img>` tags
- [ ] Site deployed to Vercel and accessible via public URL
- [ ] No console errors on any page in the core loop
- [ ] `.env` variables confirmed set in Vercel dashboard — no hardcoded keys in source

---

## 6. What Comes After the MVP

| Phase   | Name                     | Focus                                                                                |
| ------- | ------------------------ | ------------------------------------------------------------------------------------ |
| Phase 2 | **Client Handoff Ready** | Stripe live mode, Medusa Admin polish, domain, product import tools                  |
| Phase 3 | **Production Template**  | User accounts, order emails, discount engine, search                                 |
| Phase 4 | **AI Upgrade**           | Real LLM for assistant, personalised recommendations, product description generation |
