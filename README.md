## Development

Install dependencies and run the local app:

```bash
npm install
npm run dev
```

## Neon Postgres catalog setup

1. Create a Neon project and copy its pooled or direct Postgres connection string.
2. Put it in `DATABASE_URL` in the root `.env.local` file. The file is already created locally and ignored by Git.
3. Set `ADMIN_PASSWORD` to a unique password and `ADMIN_SESSION_SECRET` to a random secret of at least 32 characters in `.env.local`.
4. Set `WHATSAPP_BUSINESS_NUMBER` to the store's WhatsApp number in international format, including the country code (digits only, for example `919876543210`).
5. For a new database, open `db/schema.sql` in the Neon SQL Editor and run it. It creates the category/product, price-request, testimonial, and banner tables, seeds public appliance category labels, generic sample listings with dummy Bosch and Amazon prices, and clearly labeled demo testimonials. Prices are illustrative only; replace them with verified prices before publishing. The sample listings are not Bosch products.
6. For an existing database, run `db/migrations/001_site_banner.sql` in the Neon SQL Editor to add only the banner table without rerunning catalog seed updates.
7. For an existing database, run `db/migrations/002_bosch_amazon_prices.sql` in the Neon SQL Editor. It remaps existing price values to the new Bosch/Amazon fields and sets dummy prices only on the seeded sample products.
8. Set `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` in `.env.local` to enable image uploads in the admin. The preset must allow unsigned uploads.
9. Restart the dev server and open `/products` to see the catalog or `/admin` to sign in and manage the catalog, homepage testimonials, and products-page banner. Save a banner image in the Banner section, then activate it to display it on `/products`.

When a customer submits a better-price request, their name, phone, email, and selected product are saved in `price_requests`. If `WHATSAPP_BUSINESS_NUMBER` is configured, the site then opens a prefilled WhatsApp message addressed to the store; the customer confirms sending it in WhatsApp.

Copy the variable names from `.env.example` if needed. Product, category, and banner images are uploaded to Cloudinary and stored as public HTTPS image URLs.
