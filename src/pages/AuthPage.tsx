import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AuthPage = () => {
  const { user, isAdmin, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  if (user && isAdmin) return <Navigate to="/admin" replace />;
  if (user) return <Navigate to="/account" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password);
      if (error) setError(error.message);
      else setSuccess("Account created! You are now signed in.");
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen flex items-center">
        <div className="container-tight px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl text-foreground mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Sign in to your ChefEase account" : "Join the ChefEase family"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 sm:p-8 shadow-soft space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 rounded-xl bg-primary/10 text-primary text-sm">
                  {success}
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AuthPage;
