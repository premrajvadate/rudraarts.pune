# Rudra Arts #1771 — V12 Vercel Edition

Rudra Arts management system with customer portal, enquiries, quotations, orders, payments, inventory, production, delivery, support tickets, staff management, reviews, analytics and admin controls.

## V12 deployment architecture

- **Vercel**: Express application + frontend
- **Turso**: persistent SQLite-compatible cloud database
- **Vercel Blob**: persistent public image storage for service/gallery uploads

V12 removes the production dependency on local `better-sqlite3` storage. The app uses `@libsql/client` so the same SQL model works with a local SQLite file during development and a remote Turso database on Vercel.

## Local run

```bash
npm install
npm start
```

Local database: `rudra-arts.db`.

Open:
- `http://localhost:5000`
- `http://localhost:5000/admin-login`
- `http://localhost:5000/admin`
- `http://localhost:5000/customer`

Create the first Super Admin locally:

```bash
npm run seed-super-admin
```

## Vercel setup

1. Create a Turso database and obtain its database URL and auth token.
2. Create/connect a Vercel Blob store with **public** access because service/gallery images are public website media.
3. Push this project to GitHub.
4. Import the repository into Vercel.
5. Add these Vercel environment variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `JWT_SECRET` (32+ random characters)
   - `BLOB_READ_WRITE_TOKEN` if your Blob store is not using Vercel OIDC authentication.
6. Deploy. Vercel detects the root `server.js` Express app automatically.
7. Open the deployed site once. V12 automatically creates the database tables and default six services.
8. Create the Super Admin against the Turso database. From a local terminal, after exporting the Turso variables:

```bash
npm run seed-super-admin
```

Do **not** commit real secrets to GitHub.

## Important upload note

Vercel Functions have a request-body limit for server uploads. V12 therefore limits each uploaded image to 4 MB. For very large batches, upload smaller/compressed images or later switch the admin UI to Vercel Blob client uploads.

## Security

- HttpOnly JWT cookie
- Same-origin protection for authenticated state-changing requests
- Password hashing with bcrypt
- Login throttling
- Password change and reset flows
- Role checks for Super Admin/Admin/Customer
- Image MIME + file-signature validation
- Order state-machine validation
- Customer input validation and escaped invoice output

## Vercel-specific notes

- The production database is Turso; no SQLite data is stored on Vercel's ephemeral filesystem.
- Public service/gallery images are stored in Vercel Blob.
- The local `/uploads` directory is only a development fallback when Blob credentials are not configured.
- Local SQLite remains useful for development/testing; production uses Turso automatically when `TURSO_DATABASE_URL` is present.
