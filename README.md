# RapidKitch — Premium Kitchen Gadgets

**URL**: https://rapidkitch.vercel.app

A full-stack e-commerce store for premium kitchen gadgets, built with:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (Auth, Database, Edge Functions, Storage)
- **Hosting**: Vercel
- **Email**: Resend
- **AI Chat**: OpenAI (gpt-4o-mini)

## Local Development

Clone the repo and install dependencies:

```sh
npm install
npm run dev
```

Create a `.env` file (see `.env.example` for all required variables):

```sh
cp .env.example .env
# Fill in your Supabase credentials
```

## Deployment

The app is deployed on Vercel. Push to `main` to trigger a deployment.

Edge Functions are deployed via the Supabase CLI:

```sh
supabase functions deploy --project-ref YOUR_PROJECT_ID
```

## Environment Variables

See `.env.example` for a full list of required variables.
