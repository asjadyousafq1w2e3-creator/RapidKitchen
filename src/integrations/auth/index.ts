// Google OAuth helper — used by AuthPage.tsx for Google sign-in.
// The exported API shape is kept compatible with the existing auth UI.

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const oauthClient = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple", opts?: SignInOptions) => {
      // Redirect to our backend OAuth starter (Vercel serverless)
      if (provider === 'google') {
        const redirect = opts?.redirect_uri ? `/api/auth/google?redirect=${encodeURIComponent(opts.redirect_uri)}` : '/api/auth/google';
        window.location.href = redirect;
        return { redirected: true };
      }
      return { error: { message: 'Unsupported provider' } };
    },
  },
};
