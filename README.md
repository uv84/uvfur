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
4. Open `db/schema.sql` in the Neon SQL Editor and run it. It creates the category/product tables and inserts sample categories, subcategories, and products. Running it again safely refreshes the sample entries.
5. Restart the dev server and open `/products` to see the catalog or `/admin` to sign in and manage it.

Copy the variable names from `.env.example` if needed. Product and category image fields accept publicly accessible HTTP/HTTPS image URLs; upload storage is not configured.
