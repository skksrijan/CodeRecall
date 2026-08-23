# Contributing to CodeRecall

Thank you for your interest in contributing to CodeRecall! Please follow these guidelines to ensure a smooth collaboration process.

## Branching Convention

1. Fork the repository and clone it locally.
2. Create a new branch from `main` for your feature or bugfix. Use a descriptive name:
   - `feature/add-dark-mode`
   - `fix/auth-token-refresh`
   - `docs/update-readme`

## Local Development Setup

CodeRecall relies on external services (Firebase, PostgreSQL, Anthropic, Sentry, Upstash). Before running the app locally, ensure you have set up your `.env` file according to the Checklist in `README.md`.

> [!WARNING]  
> **Never commit your `.env` file or development-specific config files.** 
> Be careful when using `git add .` to avoid accidentally committing your private `firebaseAdmin.json` or other local credentials.

## Pull Request Requirements

Before opening a PR, ensure that your code passes all checks:

1. **Linting and TypeScript**: Run `npm run lint` and `npm run type-check`. All errors and warnings must be resolved. We do not ignore ESLint during builds.
2. **Build Test**: Run `npm run build`. The production build must succeed on your local machine before it can be merged, as this guarantees Vercel deployment will succeed.
3. **Descriptive PR**: Write a clear description of what your PR changes, why the change is necessary, and any manual testing you performed.

## Modifying the Database Schema

If your feature requires a database schema change (`schema.prisma`):
1. Make your changes in `prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name <descriptive_name>` to generate the migration file and apply it locally.
3. Commit the new migration file inside `prisma/migrations/` along with your schema changes.
