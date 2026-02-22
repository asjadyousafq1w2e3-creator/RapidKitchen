import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Wraps admin routes — redirects to /auth if not logged in, to / if not admin.
 * Shows a spinner while auth is still loading.
 */
const AdminGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return <Navigate to="/auth" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;

    return <>{children}</>;
};

export default AdminGuard;
