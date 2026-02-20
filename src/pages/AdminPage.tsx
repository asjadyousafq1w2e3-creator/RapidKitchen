import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  BarChart3, Package, ShoppingCart, Users, Plus, Edit2, Trash2,
  TrendingUp, DollarSign, X, Save, Eye
} from "lucide-react";

type Tab = "dashboard" | "products" | "orders";

const AdminPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: prods }, { data: ords }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
    ]);
    setProducts(prods || []);
    setOrders(ords || []);
    setLoading(false);
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;

  const handleDeleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    fetchData();
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    fetchData();
  };

  const handleSaveProduct = async (product: any) => {
    if (product.id) {
      const { id, created_at, updated_at, ...rest } = product;
      await supabase.from("products").update(rest).eq("id", id);
    } else {
      const { id, created_at, updated_at, ...rest } = product;
      await supabase.from("products").insert(rest);
    }
    setShowProductForm(false);
    setEditingProduct(null);
    fetchData();
  };

  const tabs = [
    { id: "dashboard" as Tab, label: "Dashboard", icon: BarChart3 },
    { id: "products" as Tab, label: "Products", icon: Package },
    { id: "orders" as Tab, label: "Orders", icon: ShoppingCart },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-tight px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your store</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  tab === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Dashboard */}
          {tab === "dashboard" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {[
                  { label: "Total Revenue", value: `PKR ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
                  { label: "Orders", value: totalOrders, icon: ShoppingCart, color: "text-accent" },
                  { label: "Products", value: totalProducts, icon: Package, color: "text-primary" },
                  { label: "Conversion", value: "3.2%", icon: TrendingUp, color: "text-accent" },
                ].map((stat, i) => (
                  <div key={i} className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className="font-display text-2xl sm:text-3xl text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft">
                <h3 className="font-display text-lg text-foreground mb-4">Recent Orders</h3>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-background rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-foreground">#{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">PKR {order.total_price?.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === "completed" ? "bg-primary/10 text-primary" :
                            order.status === "pending" ? "bg-accent/10 text-accent" :
                            "bg-secondary text-secondary-foreground"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Products */}
          {tab === "products" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display text-xl text-foreground">All Products ({products.length})</h3>
                <button
                  onClick={() => { setEditingProduct({ name: "", slug: "", price: 0, description: "", short_description: "", images: [], category: "General", features: [], in_stock: true, stock_quantity: 100 }); setShowProductForm(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>

              {showProductForm && editingProduct && (
                <ProductForm
                  product={editingProduct}
                  onSave={handleSaveProduct}
                  onCancel={() => { setShowProductForm(false); setEditingProduct(null); }}
                />
              )}

              <div className="space-y-3">
                {products.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-4 bg-card rounded-2xl p-4 shadow-soft">
                    <img src={p.images?.[0] || ""} alt={p.name} className="w-14 h-14 rounded-xl object-cover bg-secondary" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">{p.name}</h4>
                      <p className="text-xs text-muted-foreground">{p.category} • Stock: {p.stock_quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">PKR {p.price?.toLocaleString()}</p>
                      {p.badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">{p.badge}</span>}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingProduct(p); setShowProductForm(true); }}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Orders */}
          {tab === "orders" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <h3 className="font-display text-xl text-foreground">All Orders ({orders.length})</h3>
              {orders.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl shadow-soft">
                  <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order: any) => (
                    <div key={order.id} className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-secondary border-none text-foreground outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <span className="text-sm font-bold text-foreground">PKR {order.total_price?.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Payment: {order.payment_method}</p>
                        {order.shipping_address && (
                          <p>Ship to: {(order.shipping_address as any)?.city || "N/A"}</p>
                        )}
                        <p>{order.order_items?.length || 0} item(s)</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

const ProductForm = ({ product, onSave, onCancel }: { product: any; onSave: (p: any) => void; onCancel: () => void }) => {
  const [form, setForm] = useState(product);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      images: typeof form.images === "string" ? form.images.split(",").map((s: string) => s.trim()) : form.images,
      features: typeof form.features === "string" ? form.features.split(",").map((s: string) => s.trim()) : form.features,
      colors: form.colors ? (typeof form.colors === "string" ? form.colors.split(",").map((s: string) => s.trim()) : form.colors) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-foreground">{product.id ? "Edit Product" : "New Product"}</h3>
        <button type="button" onClick={onCancel} className="p-2 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Name", key: "name", required: true },
          { label: "Slug", key: "slug" },
          { label: "Price (PKR)", key: "price", type: "number", required: true },
          { label: "Original Price", key: "original_price", type: "number" },
          { label: "Category", key: "category", required: true },
          { label: "Badge", key: "badge" },
          { label: "Stock Quantity", key: "stock_quantity", type: "number" },
          { label: "Rating", key: "rating", type: "number" },
        ].map((field) => (
          <div key={field.key}>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">{field.label}</label>
            <input
              type={field.type || "text"}
              required={field.required}
              value={form[field.key] || ""}
              onChange={(e) => setForm({ ...form, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
        ))}
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Short Description</label>
        <input
          value={form.short_description || ""}
          onChange={(e) => setForm({ ...form, short_description: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Description</label>
        <textarea
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary resize-none"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Images (comma-separated URLs)</label>
        <input
          value={Array.isArray(form.images) ? form.images.join(", ") : form.images || ""}
          onChange={(e) => setForm({ ...form, images: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Features (comma-separated)</label>
        <input
          value={Array.isArray(form.features) ? form.features.join(", ") : form.features || ""}
          onChange={(e) => setForm({ ...form, features: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Colors (comma-separated, optional)</label>
        <input
          value={Array.isArray(form.colors) ? form.colors.join(", ") : form.colors || ""}
          onChange={(e) => setForm({ ...form, colors: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary"
        />
      </div>
      <button type="submit" className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> {product.id ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
};

export default AdminPage;
