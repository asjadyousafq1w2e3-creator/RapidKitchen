import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Simplified OAuth callback page. Backend handles the exchange and sets cookie.
 * We just check session and redirect appropriately.
 */
const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const finalize = async () => {
            try {
                const resp = await fetch('/api/auth/me');
                const json = await resp.json();
                const user = json.user;
                if (user) {
                    navigate(user.role === 'admin' ? '/admin' : '/account', { replace: true });
                } else {
                    navigate('/auth', { replace: true });
                }
            } catch (e) {
                console.error(e);
                navigate('/auth', { replace: true });
            }
        };
        finalize();
    }, [navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Finalizing sign-in…</p>
        </div>
    );
};

export default AuthCallback;
