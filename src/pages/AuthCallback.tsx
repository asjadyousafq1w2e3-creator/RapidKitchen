import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * This page is the OAuth redirect target for Google sign-in.
 * Supabase appends the auth tokens in the URL hash (#access_token=...).
 * We let the Supabase client pick them up, then redirect to the right page.
 */
const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            // exchangeCodeForSession handles both PKCE code and implicit hash flows
            const { data, error } = await supabase.auth.exchangeCodeForSession(
                window.location.href
            );

            if (error) {
                console.error("OAuth callback error:", error.message);
                navigate("/auth?error=" + encodeURIComponent(error.message), { replace: true });
                return;
            }

            // Check if admin so we can redirect there
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
            <p className="text-sm text-muted-foreground">Signing you in…</p>
        </div>
    );
};

export default AuthCallback;
