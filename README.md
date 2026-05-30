# Kitchub Store 🍳

**URL**: https://kitchub.store

A full-stack e-commerce store for premium kitchen gadgets, built with:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
-- **Backend**: Vercel serverless API + MongoDB Atlas (orders, products, auth endpoints)
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
# Fill in your MongoDB, Google OAuth, and Resend credentials
```

## Deployment

The app is deployed on Vercel. Push to `main` to trigger a deployment.

## Environment Variables

See `.env.example` for a full list of required variables.
