import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown,
  ArrowUpRight, Eye
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    const [{ data: orders }, { data: products }, { count: customerCount }] = await Promise.all([
      supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("user_id", { count: "exact", head: true }),
    ]);

    const totalRevenue = (orders || []).reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);
    setStats({
      revenue: totalRevenue,
      orders: orders?.length || 0,
      products: products?.length || 0,
      customers: customerCount || 0,
    });
    setRecentOrders((orders || []).slice(0, 8));
    setTopProducts((products || []).slice(0, 5));
    setLoading(false);
  };

  const statCards = [
    { label: "Total Revenue", value: `PKR ${stats.revenue.toLocaleString()}`, icon: DollarSign, change: "+12.5%", up: true, color: "text-primary" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingCart, change: "+8.2%", up: true, color: "text-accent" },
    { label: "Products", value: stats.products, icon: Package, change: "Active", up: true, color: "text-primary" },
    { label: "Customers", value: stats.customers, icon: Users, change: "+5.1%", up: true, color: "text-accent" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's your store overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-5 shadow-soft"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="font-display text-2xl text-foreground">{stat.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {stat.up ? <TrendingUp className="w-3 h-3 text-primary" /> : <TrendingDown className="w-3 h-3 text-destructive" />}
                <span className="text-xs text-muted-foreground">{stat.change}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-foreground">Recent Orders</h3>
              <Link to="/admin/orders" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs text-muted-foreground font-medium">Order</th>
                      <th className="text-left py-2 text-xs text-muted-foreground font-medium">Date</th>
                      <th className="text-left py-2 text-xs text-muted-foreground font-medium">Status</th>
                      <th className="text-right py-2 text-xs text-muted-foreground font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/50">
                        <td className="py-3 text-foreground font-medium">#{order.id.slice(0, 8)}</td>
                        <td className="py-3 text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="py-3 text-right font-medium text-foreground">PKR {order.total_price?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top Products */}
          <div className="bg-card rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-foreground">Top Products</h3>
              <Link to="/admin/products" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                View All <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {topProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <img src={p.images?.[0] || ""} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-secondary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <p className="text-sm font-bold text-foreground">PKR {p.price?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: "bg-accent/10 text-accent",
    confirmed: "bg-primary/10 text-primary",
    shipped: "bg-primary/20 text-primary",
    delivered: "bg-primary/30 text-primary",
    cancelled: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${colors[status] || "bg-secondary text-secondary-foreground"}`}>
      {status}
    </span>
  );
};

export default AdminDashboard;
