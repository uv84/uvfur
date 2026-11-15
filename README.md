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
5. To send automatic store notifications, configure `WHATSAPP_CLOUD_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_NOTIFICATION_TEMPLATE_NAME`, `WHATSAPP_NOTIFICATION_TEMPLATE_LANGUAGE`, and `WHATSAPP_GRAPH_API_VERSION` in `.env.local`. Create and get approval for a WhatsApp message template named `better_price_request` with this body: `New better-price request for {{1}} from {{2}}. Phone: {{3}}. Email: {{4}}.` The parameters are product name, customer name, customer phone, and customer email. The default language is `en_US`. `WHATSAPP_BUSINESS_NUMBER` is the recipient; it must be able to receive messages from the configured Cloud API sender and must be different from the sender number.
6. For a new database, open `db/schema.sql` in the Neon SQL Editor and run it. It creates the category/product, price-request, testimonial, and banner tables, seeds public appliance category labels, generic sample listings with dummy Bosch, Amazon, and Flipkart prices, and clearly labeled demo testimonials. Prices are illustrative only; replace them with verified prices before publishing. The sample listings are not Bosch products.
7. For an existing database, run `db/migrations/001_site_banner.sql` in the Neon SQL Editor to add only the banner table without rerunning catalog seed updates.
8. For an existing database, run `db/migrations/002_bosch_amazon_prices.sql` in the Neon SQL Editor. It remaps existing price values to the new Bosch/Amazon fields and sets dummy prices only on the seeded sample products.
9. For an existing database, run `db/migrations/003_flipkart_prices.sql` in the Neon SQL Editor to add Flipkart prices and seed illustrative values for sample products.
10. For an existing database, run `db/migrations/004_festive_offer.sql` in the Neon SQL Editor to add the festival name and festive-offer toggle to the banner.
11. Set `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` in `.env.local` to enable image uploads in the admin. The preset must allow unsigned uploads.
12. Restart the dev server and open `/products` to see the catalog or `/admin` to sign in and manage the catalog, homepage testimonials, and products-page banner. Save a festival name and enable its festive-offer label in the Banner tab to show it above product prices.

When a customer submits a better-price request, their name, phone, email, and selected product are saved in `price_requests`. If the WhatsApp Cloud API settings are configured, the site also sends the store a template notification. The customer is still taken to the prefilled WhatsApp message and can send it directly to the store as before. If automatic delivery fails, the form shows a manual WhatsApp link instead.

Copy the variable names from `.env.example` if needed, but replace every placeholder and keep real tokens only in `.env.local`. Product, category, and banner images are uploaded to Cloudinary and stored as public HTTPS image URLs.
