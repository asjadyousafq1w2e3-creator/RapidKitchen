import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * This page is the OAuth redirect target for Google sign-in.
 */
const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");
            const hash = url.hash;

            // ONLY try to exchange if there's actually a code or a hash in the URL.
            // This prevents "accidental" mounts of this page from killing the active session.
            if (!code && !hash.includes("access_token=") && !hash.includes("error=")) {
                console.log("[AuthCallback] No auth code or token found in URL, skipping exchange.");
                navigate("/", { replace: true });
                return;
            }

            // We do NOT need to manually call exchangeCodeForSession.
            // The Supabase JS Client automatically detects the `code` in the URL
            // and exchanges it in the background on load.
            // Trying to exchange it manually causes a "400 Bad Request" (PKCE verifier consumed).

            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // If the background exchange was already fast enough to get the session
                const { data: roleData } = await supabase
                    .from("user_roles")
                    .select("role")
                    .eq("user_id", session.user.id)
                    .eq("role", "admin")
                    .maybeSingle();

                navigate(roleData ? "/admin" : "/account", { replace: true });
            } else {
                // Listen for the auth event to complete in the background
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
                    if (event === 'SIGNED_IN' && currentSession?.user) {
                        const { data: roleData } = await supabase
                            .from("user_roles")
                            .select("role")
                            .eq("user_id", currentSession.user.id)
                            .eq("role", "admin")
                            .maybeSingle();

                        navigate(roleData ? "/admin" : "/account", { replace: true });
                    } else if (event === 'SIGNED_OUT') {
                        navigate("/auth?error=" + encodeURIComponent("Authentication failed"), { replace: true });
                    }
                });

                // Cleanup
                return () => subscription.unsubscribe();
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Finalizing sign-in…</p>
        </div>
    );
};

export default AuthCallback;
