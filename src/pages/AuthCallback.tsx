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

            console.log("[AuthCallback] Exchanging code/token for session...");
            const { data, error } = await supabase.auth.exchangeCodeForSession(
                window.location.href
            );

            if (error) {
                console.error("OAuth callback error:", error.message);
                // If we already have a user, don't redirect to /auth, just go home
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    console.log("[AuthCallback] Error occurred but user is already signed in. Going home.");
                    navigate("/", { replace: true });
                } else {
                    navigate("/auth?error=" + encodeURIComponent(error.message), { replace: true });
                }
                return;
            }

            if (data.session?.user) {
                const { data: roleData } = await supabase
                    .from("user_roles")
                    .select("role")
                    .eq("user_id", data.session.user.id)
                    .eq("role", "admin")
                    .maybeSingle();

                navigate(roleData ? "/admin" : "/account", { replace: true });
            } else {
                navigate("/", { replace: true });
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
