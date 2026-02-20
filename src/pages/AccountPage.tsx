import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Heart, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AccountPage = () => {
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const [{ data: ords }, { data: wishes }] = await Promise.all([
      supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
      supabase.from("wishlists").select("*, products(name, price, images, slug)").order("created_at", { ascending: false }),
    ]);
    setOrders(ords || []);
    setWishlists(wishes || []);
    setLoading(false);
  };

  const removeFromWishlist = async (id: string) => {
    await supabase.from("wishlists").delete().eq("id", id);
    fetchData();
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-tight px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl text-foreground">My Account</h1>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium">
                  Admin Panel
                </Link>
              )}
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* Orders */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl text-foreground">My Orders</h2>
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl shadow-soft">
                <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No orders yet</p>
                <Link to="/shop" className="text-primary text-sm hover:underline mt-2 inline-block">Browse Products</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-card rounded-2xl p-4 sm:p-5 shadow-soft">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">PKR {order.total_price?.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          order.status === "delivered" ? "bg-primary/10 text-primary" :
                          order.status === "shipped" ? "bg-accent/10 text-accent" :
                          "bg-secondary text-secondary-foreground"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{order.order_items?.length || 0} item(s) • {order.payment_method}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Wishlist */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-accent" />
              <h2 className="font-display text-xl text-foreground">My Wishlist</h2>
            </div>
            {wishlists.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl shadow-soft">
                <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Your wishlist is empty</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {wishlists.map((w: any) => (
                  <div key={w.id} className="bg-card rounded-2xl overflow-hidden shadow-soft">
                    <Link to={`/product/${w.products?.slug}`}>
                      <img src={w.products?.images?.[0] || ""} alt={w.products?.name} className="w-full aspect-square object-cover" />
                    </Link>
                    <div className="p-3">
                      <p className="text-sm font-medium text-foreground truncate">{w.products?.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-foreground">PKR {w.products?.price?.toLocaleString()}</span>
                        <button onClick={() => removeFromWishlist(w.id)} className="text-muted-foreground hover:text-destructive">
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AccountPage;
