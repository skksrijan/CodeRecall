# CodeRecall

CodeRecall — a personalized spaced-repetition notebook for LeetCode practice.

## Local Development vs. Production Setup

CodeRecall uses PostgreSQL via Prisma. Because `provider = "postgresql"` is used in the `schema.prisma`, you can use the same codebase for both local development and production.

### Local Development
1. Ensure PostgreSQL is installed locally.
2. In your `.env` file, set the `DATABASE_URL` to your local database (e.g., `postgresql://postgres:password@localhost:5432/coderecall?schema=public`).
3. Run `npx prisma migrate dev` to apply schemas.
4. Run `npm run dev` to start the app.

### Production Setup (Vercel + Hosted Postgres)
For production, you need a hosted PostgreSQL database (e.g., Neon, Supabase, Railway).
1. Get the connection string from your hosting provider.
2. In your Vercel project settings, set `DATABASE_URL` to this connection string.
3. **Database Migrations on Vercel:** We use Prisma's deployment migration tool. Make sure your `package.json` build script includes it (or Vercel will do it if configured properly, typically by changing your build command to `npx prisma generate && npx prisma migrate deploy && next build`).
4. Set up the other environment variables (see below).

---

## Environment Variables Checklist

To run CodeRecall locally or in production, you must have the following environment variables configured:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `DATABASE_URL` | PostgreSQL connection string | Your local Postgres DB, or Neon/Supabase for production |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Client API Key | Firebase Console -> Project Settings -> Web App |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Client Auth Domain | Firebase Console -> Project Settings -> Web App |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Client Project ID | Firebase Console -> Project Settings -> Web App |
| `FIREBASE_PROJECT_ID` | Firebase Admin SDK Project ID | Firebase Console -> Project Settings -> Service Accounts |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK Client Email | Firebase Console -> Project Settings -> Service Accounts |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK Private Key | Firebase Console -> Project Settings -> Service Accounts (Generate New Private Key) |
| `ANTHROPIC_API_KEY` | Anthropic API Key for AI Feedback | Anthropic Developer Console |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry Error Tracking DSN | Sentry.io -> Project Settings -> Client Keys |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | Upstash Console -> Database -> REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token | Upstash Console -> Database -> REST API |
