# A Great Escape Website and Admin CMS

Production-ready Next.js app for A Great Escape private lake cruises, with a protected admin panel, booking management, editable CMS content, payment settings, and PostgreSQL persistence through Prisma.

## Local Setup

```bash
npm install
cp .env.example .env
npm run db:migrate:deploy
npm run seed
npm run dev
```

Open `http://localhost:3000`. Admin login is at `http://localhost:3000/admin/login`.

## Required Environment Variables

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
AUTH_SECRET=replace-with-a-secure-random-string
ADMIN_EMAIL=admin@greatescapemn.com
ADMIN_PASSWORD=replace-with-a-strong-password
NEXT_PUBLIC_SITE_URL=https://your-production-domain
```

`DATABASE_URL` is supplied automatically when you add Railway PostgreSQL. `AUTH_SECRET` signs admin session cookies; generate it with `openssl rand -base64 32`. `ADMIN_EMAIL` and `ADMIN_PASSWORD` are used by `npm run seed` to create the first admin account.

Optional booking notification variables:

```bash
RESEND_API_KEY=re_your_resend_api_key
BOOKING_NOTIFICATION_EMAIL=admin@greatescapemn.com
EMAIL_FROM="A Great Escape <bookings@yourdomain.com>"
```

If these are set, every public booking request is saved to the database and an email notification is sent to `BOOKING_NOTIFICATION_EMAIL`. If they are not set, bookings still appear in Admin > Bookings.

Optional payment variables can be configured in the admin panel instead of environment variables:

```bash
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

## Railway Deployment

1. Push this repository to GitHub.
2. In Railway, create a new project from the GitHub repo.
3. Add a PostgreSQL database to the Railway project.
4. Set the required environment variables above. Use Railway's generated `DATABASE_URL`.
5. Set the Railway commands exactly as:

```bash
Build Command: npm run build
Start Command: npm run start
```

6. Deploy the app.
7. Run the database commands from the Railway service shell or one-off command runner:

```bash
npm run db:migrate:deploy
npm run seed
```

The seed command is safe to rerun. It creates or confirms the admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD`, seeds packages, FAQs, gallery images, business info, homepage content, SEO settings, site settings, payment settings, and demo bookings.

## App Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run seed
```

## Verification Notes

- Admin pages under `/admin` are protected by middleware, except `/admin/login`.
- Admin APIs under `/api/admin/*` verify the signed admin cookie before returning or mutating data.
- Public booking submission posts to `/api/bookings` and creates a `Booking` record in PostgreSQL.
- Admin booking management uses `/api/admin/bookings` and `/api/admin/bookings/[id]` to view, update status/notes/quotes/payment status, and delete bookings.
- Packages, FAQs, gallery, business info, homepage sections, page content, SEO settings, testimonials, lakes, site settings, and payment settings are editable from the admin panel.
- Public sections read through `/api/public/*`, which queries the same Prisma/PostgreSQL data source edited by admin.
