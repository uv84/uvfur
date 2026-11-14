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
5. Open `db/schema.sql` in the Neon SQL Editor and run it. It creates the category/product and price-request tables, seeds public appliance category labels and generic sample listings, and can be run again to refresh those examples. The sample listings are not Bosch products; replace them with authorized product data before selling.
6. Restart the dev server and open `/products` to see the catalog or `/admin` to sign in and manage it.

When a customer submits a better-price request, their name, phone, email, and selected product are saved in `price_requests`. If `WHATSAPP_BUSINESS_NUMBER` is configured, the site then opens a prefilled WhatsApp message addressed to the store; the customer confirms sending it in WhatsApp.

Copy the variable names from `.env.example` if needed. Product and category image fields accept publicly accessible HTTP/HTTPS image URLs; upload storage is not configured.
