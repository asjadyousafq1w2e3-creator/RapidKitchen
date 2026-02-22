// Replaces Lovable's cloud-auth-js with native Supabase OAuth.
// The exported API shape is identical so AuthPage.tsx needs no changes.

import { supabase } from "../supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple", opts?: SignInOptions) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: opts?.redirect_uri ?? window.location.origin,
          queryParams: opts?.extraParams,
        },
      });
      if (error) return { error };
      // Supabase redirects the browser; nothing more to do here.
      return { redirected: true };
    },
  },
};
