import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Heart, LogOut, User, ChevronDown, ChevronUp, MapPin, Phone, Mail, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const getStatusStep = (status: string) => {
  switch (status) {
    case 'pending': return 1;
    case 'confirmed': return 2;
    case 'shipped': return 3;
    case 'delivered': return 4;
    default: return 1;
  }
};

const AccountPage = () => {
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [ordersResp, wishlistResp] = await Promise.all([fetch('/api/orders'), fetch('/api/wishlist')]);
      const ordersJson = await ordersResp.json();
      const wishlistJson = await wishlistResp.json();
      const ords = ordersJson.orders || ordersJson.order ? (ordersJson.orders || [ordersJson.order]) : [];
      setOrders(ords || []);
      setWishlists(wishlistJson.wishlists || []);
    } catch (e) {
      console.error('Failed to fetch account data', e);
      setOrders([]);
      setWishlists([]);
    }
    setLoading(false);
  };

  const removeFromWishlist = async (id: string) => {
    setWishlists((s) => s.filter((w) => w.id !== id));
    try {
      await fetch('/api/wishlist', { method: 'DELETE', body: JSON.stringify({ id }), headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
      // ignore
    }
  };

  // Wait for auth to finish loading before deciding to redirect
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-tight px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-5 sm:p-6 bg-card rounded-3xl border border-border shadow-soft">
            <div className="flex items-center gap-4">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "User Profile"}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-border shadow-sm"
                  loading="lazy"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
              )}
              <div>
                <h1 className="font-display text-2xl sm:text-3xl text-foreground">{user.name || "My Account"}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2 self-start sm:self-center">
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-all shadow-soft">
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
              <div className="space-y-4">
                {orders.map((order: any) => {
                  const oId = (order.id || order._id || '').toString();
                  const isExpanded = expandedOrder === oId;
                  const oItems = order.items || order.order_items || [];
                  const oShipping = order.shipping || order.shipping_address;
                  const currentStep = getStatusStep(order.status);

                  return (
                    <div key={oId} className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden transition-all duration-300">
                      {/* Accordion Trigger Header */}
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : oId)}
                        className="w-full text-left p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/20 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">Order #{oId.slice(0, 8)}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              order.status === "delivered" ? "bg-primary/10 text-primary" :
                              order.status === "shipped" ? "bg-accent/10 text-accent" :
                              order.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                              "bg-secondary text-secondary-foreground"
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2">
                            <span>Placed: {new Date(order.createdAt || order.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{oItems.length} item(s)</span>
                          </p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-border/40 sm:border-0 pt-3 sm:pt-0">
                          <div className="sm:text-right">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">Total Bill</span>
                            <p className="text-base font-extrabold text-foreground">PKR {(order.total || order.total_price || 0).toLocaleString()}</p>
                          </div>
                          <div className="w-8 h-8 rounded-xl bg-secondary/80 flex items-center justify-center text-muted-foreground">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </button>

                      {/* Expandable Details Drawer */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="border-t border-border bg-secondary/10"
                          >
                            <div className="p-5 sm:p-6 space-y-6">
                              {/* 1. Interactive Progress Tracker */}
                              {order.status !== 'cancelled' && (
                                <div className="bg-card rounded-2xl p-4 border border-border/50">
                                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-4">Delivery Status</span>
                                  <div className="relative flex justify-between items-center max-w-md mx-auto py-2">
                                    <div className="absolute left-0 right-0 h-1 bg-secondary top-1/2 -translate-y-1/2 rounded" />
                                    <div 
                                      className="absolute left-0 h-1 bg-primary top-1/2 -translate-y-1/2 rounded transition-all duration-500" 
                                      style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                    />
                                    {[
                                      { label: 'Ordered', step: 1, icon: Clock },
                                      { label: 'Confirmed', step: 2, icon: CheckCircle2 },
                                      { label: 'Shipped', step: 3, icon: Package },
                                      { label: 'Delivered', step: 4, icon: CheckCircle2 }
                                    ].map((s) => {
                                      const StepIcon = s.icon;
                                      const isActive = currentStep >= s.step;
                                      return (
                                        <div key={s.step} className="relative z-10 flex flex-col items-center gap-1.5">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                            isActive 
                                              ? 'bg-primary text-primary-foreground border-primary shadow-soft' 
                                              : 'bg-card text-muted-foreground border-border'
                                          }`}>
                                            <StepIcon className="w-4 h-4" />
                                          </div>
                                          <span className={`text-[10px] font-semibold tracking-wide transition-colors ${
                                            isActive ? 'text-primary font-bold' : 'text-muted-foreground'
                                          }`}>{s.label}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* 2. Structured Grid Info: Shipping & Billing */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Shipping details card */}
                                {oShipping && (
                                  <div className="bg-card rounded-2xl p-4 border border-border/50 flex flex-col justify-between">
                                    <div>
                                      <div className="flex items-center gap-1.5 mb-3">
                                        <MapPin className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Shipping Destination</span>
                                      </div>
                                      <p className="text-sm font-semibold text-foreground mb-1">{oShipping.firstName} {oShipping.lastName || ''}</p>
                                      <p className="text-xs text-muted-foreground leading-relaxed">{oShipping.address}</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">{oShipping.city}, {oShipping.state || ''} {oShipping.zip || ''}</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5 pt-3 border-t border-border/40 mt-4 text-[11px] text-muted-foreground">
                                      <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-muted-foreground/60" /> {oShipping.phone}</p>
                                      <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-muted-foreground/60" /> {oShipping.email}</p>
                                    </div>
                                  </div>
                                )}

                                {/* Billing overview card */}
                                <div className="bg-card rounded-2xl p-4 border border-border/50 flex flex-col justify-between">
                                  <div>
                                    <div className="flex items-center gap-1.5 mb-3">
                                      <CreditCard className="w-3.5 h-3.5 text-primary" />
                                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Billing Overview</span>
                                    </div>
                                    <div className="space-y-1.5 text-xs">
                                      <div className="flex justify-between"><span className="text-muted-foreground">Payment Method</span><span className="font-medium text-foreground capitalize">{oShipping?.paymentMethod || order.payment_method || 'Cash on Delivery'}</span></div>
                                      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-foreground">PKR {(order.total || order.total_price || 0).toLocaleString()}</span></div>
                                      <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-primary font-medium">Free</span></div>
                                    </div>
                                  </div>
                                  <div className="pt-3 border-t border-border/40 mt-4 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-foreground">Grand Total</span>
                                    <span className="text-base font-extrabold text-foreground">PKR {(order.total || order.total_price || 0).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* 3. Items Detailed List */}
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-3 pl-1">Items Included</span>
                                <div className="space-y-2">
                                  {oItems.map((item: any, idx: number) => (
                                    <div key={item.id || idx} className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border/55 hover:border-primary/20 transition-all shadow-sm">
                                      {item.image ? (
                                        <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0 border border-border/40" />
                                      ) : (
                                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 border border-border text-muted-foreground font-bold">
                                          #
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">{item.name || item.product_name}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.qty || item.quantity} {item.color && `• ${item.color}`}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-bold text-foreground">PKR {((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString()}</p>
                                        <span className="text-[10px] text-muted-foreground block">PKR {Number(item.price || 0).toLocaleString()} each</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
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
