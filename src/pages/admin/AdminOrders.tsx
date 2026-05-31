import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import { StatusBadge } from "./AdminDashboard";
import { ShoppingCart, Search, Eye, X, Printer } from "lucide-react";
import { toast } from "sonner";

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      setOrders(json.orders || []);
    } catch (e) {
      console.error('Failed to load orders', e);
      setOrders([]);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
      if (!res.ok) throw new Error('Update failed');
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update order');
    }
  };

  const filtered = orders.filter((o) => {
    const idStr = (o.id || o._id || '').toString();
    const matchSearch = idStr.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">{orders.length} total orders</p>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["all", "pending", "confirmed", "shipped", "delivered", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filterStatus === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              <span className="capitalize">{s}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === s ? "bg-primary-foreground/20" : "bg-muted"}`}>
                {statusCounts[s]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-card rounded-xl border border-border max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden sm:table-cell">Items</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden md:table-cell">Payment</th>
                  <th className="text-right py-3 px-4 text-xs text-muted-foreground font-medium">Total</th>
                  <th className="text-right py-3 px-4 text-xs text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">#{order.id.slice(0, 8)}</td>
                    <td className="py-3 px-4 text-muted-foreground">{new Date(order.createdAt || order.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{(order.items || order.order_items || []).length} items</td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg bg-secondary border-none text-foreground outline-none cursor-pointer font-medium"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell capitalize">
                      {order.shipping?.paymentMethod || order.payment_method || 'Cash on Delivery'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-foreground">PKR {(order.total || order.total_price || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
              onClick={() => setSelectedOrder(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="bg-card rounded-2xl p-6 shadow-elevated w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display text-xl text-foreground font-semibold">Order #{(selectedOrder.id || selectedOrder._id || '').toString().slice(0, 8)}</h3>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-secondary transition-colors"><X className="w-4 h-4" /></button>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-3 text-sm border-b border-border/50 pb-4">
                    <div><span className="text-muted-foreground font-medium">Status:</span> <StatusBadge status={selectedOrder.status} /></div>
                    <div><span className="text-muted-foreground font-medium">Payment:</span> <span className="text-foreground font-semibold capitalize">{selectedOrder.shipping?.paymentMethod || selectedOrder.payment_method || 'Cash on Delivery'}</span></div>
                    <div><span className="text-muted-foreground font-medium">Date:</span> <span className="text-foreground">{new Date(selectedOrder.createdAt || selectedOrder.created_at).toLocaleString()}</span></div>
                    <div><span className="text-muted-foreground font-medium">Total:</span> <span className="font-bold text-foreground">PKR {(selectedOrder.total || selectedOrder.total_price || 0).toLocaleString()}</span></div>
                  </div>

                  {(() => {
                    const shipping = selectedOrder.shipping || selectedOrder.shipping_address;
                    if (!shipping) return null;
                    return (
                      <div className="bg-secondary/40 rounded-2xl p-4 border border-border/40">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Shipping & Contact Details</p>
                        <div className="text-sm text-foreground space-y-1">
                          <p className="font-semibold text-base">{shipping.firstName} {shipping.lastName || ''}</p>
                          <p className="text-muted-foreground">{shipping.address}</p>
                          <p className="text-muted-foreground">{shipping.city}, {shipping.state || ''} {shipping.zip || ''}</p>
                          <div className="flex flex-wrap gap-x-4 pt-2 text-xs border-t border-border/30 mt-2">
                            <p><span className="text-muted-foreground font-medium">Phone:</span> {shipping.phone}</p>
                            <p><span className="text-muted-foreground font-medium">Email:</span> {shipping.email}</p>
                          </div>
                          {shipping.notes && (
                            <div className="mt-3 bg-background/50 rounded-xl p-2.5 border border-border/30">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">Order Note</span>
                              <p className="text-xs italic text-muted-foreground">"{shipping.notes}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2.5">Items Ordered</p>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {(selectedOrder.items || selectedOrder.order_items || []).map((item: any, idx: number) => (
                        <div key={item.id || idx} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/40 hover:bg-secondary/40 transition-colors">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-11 h-11 rounded-lg object-cover shadow-sm flex-shrink-0" />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 border border-border/50 text-muted-foreground font-bold">
                              #
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{item.name || item.product_name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.qty || item.quantity} {item.color && `• ${item.color}`}</p>
                          </div>
                          <p className="text-sm font-bold text-foreground flex-shrink-0">
                            PKR {((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
