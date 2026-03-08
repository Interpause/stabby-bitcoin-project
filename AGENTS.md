# Development Guide

## Tech Stack

- Next.js v16 with React 19: Use React Server Components & Suspense where applicable.
- Component library is shadcn using Base UI, Tailwind v4, and Lucide icons.
- Orval used to generate Vercel SWR SDKs for third-party APIs inside the `sdk/` folder; MSW and Zod are included.

## Project Structure

- `app/`: Next.js app folder.
- `components/`: UI components.
    - `ui/`: Where shadcn components are saved.
- `lib/`: Utils and business logic.
- `public/`: Static/public folder.
- `sdk/`: Orval-generated SDKs for thirdparty APIs.

## Tips

- When exploring a thirdparty API, look for the `.json` OpenAPI spec file within `sdk/`. Only check the SDK when actually implementing.
