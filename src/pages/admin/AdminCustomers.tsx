import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "@/components/admin/AdminLayout";
import { Users, Search, ShoppingCart, DollarSign, X, Calendar, MapPin, Mail, Phone, ChevronRight } from "lucide-react";

const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
};

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/orders');
      const json = await resp.json();
      const orders = json.orders || [];

      const userMap: Record<string, any> = {};
      orders.forEach((o: any) => {
        // FIXED LOOPHOLE: Map by user ID (registered) or fallback to shipping email (guest buyers)
        // Previously up to 50% of guest order buyers were completely missing from this view!
        const uid = o.user?.id || o.shipping?.email || 'guest_' + o._id;
        const oDate = o.createdAt || o.created_at;

        if (!userMap[uid]) {
          userMap[uid] = {
            user_id: uid,
            total_spent: 0,
            order_count: 0,
            last_order: oDate,
            email: o.user?.email || o.shipping?.email || 'Guest Customer',
            name: o.user?.name || `${o.shipping?.firstName || ''} ${o.shipping?.lastName || ''}`.trim() || 'Guest Customer',
            city: o.shipping?.city || 'N/A',
            phone: o.shipping?.phone || 'N/A',
            address: o.shipping?.address || 'N/A',
            customer_type: o.user?.id ? 'Registered' : 'Guest',
            orders: []
          };
        }

        userMap[uid].total_spent += o.total || o.total_price || 0;
        userMap[uid].order_count += 1;
        
        // Push order details to user's history list
        userMap[uid].orders.push({
          id: o.id || o._id,
          date: oDate,
          total: o.total || o.total_price || 0,
          status: o.status,
          itemsCount: (o.items || o.order_items || []).length
        });

        if (new Date(userMap[uid].last_order) < new Date(oDate)) {
          userMap[uid].last_order = oDate;
        }
      });

      setCustomers(Object.values(userMap));
    } catch (e) {
      console.error('Failed to fetch orders for customers', e);
      setCustomers([]);
    }
    setLoading(false);
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-foreground font-semibold">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">{customers.length} total shoppers (including Guest buyers)</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 bg-card rounded-xl border border-border max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            <div className="h-40 bg-secondary rounded-2xl animate-pulse" />
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-soft overflow-hidden border border-border/50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Customer</th>
                    <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden sm:table-cell">Email</th>
                    <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden md:table-cell">City</th>
                    <th className="text-center py-3 px-4 text-xs text-muted-foreground font-medium">Orders</th>
                    <th className="text-right py-3 px-4 text-xs text-muted-foreground font-medium">Total Spent</th>
                    <th className="text-right py-3 px-4 text-xs text-muted-foreground font-medium hidden lg:table-cell">Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr 
                      key={c.user_id} 
                      onClick={() => setSelectedCustomer(c)}
                      className="border-b border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/10 shadow-sm">
                            {getInitials(c.name)}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">{c.name}</span>
                            <span className={`text-[9px] font-semibold px-1 rounded uppercase ${
                              c.customer_type === 'Registered' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                            }`}>
                              {c.customer_type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground hidden sm:table-cell">{c.email}</td>
                      <td className="py-3.5 px-4 text-muted-foreground hidden md:table-cell">{c.city}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-secondary/60 text-muted-foreground font-medium text-xs">
                          <ShoppingCart className="w-3.5 h-3.5" /> {c.order_count}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-foreground">PKR {c.total_spent.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right text-muted-foreground hidden lg:table-cell font-medium">
                        {new Date(c.last_order).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No customers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customer Detail Drawer / Side-Modal */}
        <AnimatePresence>
          {selectedCustomer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-start justify-end p-0"
              onClick={() => setSelectedCustomer(null)}
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="bg-card h-screen w-full max-w-md shadow-elevated border-l border-border flex flex-col p-6 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                  <h3 className="font-display text-lg text-foreground font-semibold">Customer Profile</h3>
                  <button onClick={() => setSelectedCustomer(null)} className="p-2 rounded-xl hover:bg-secondary transition-colors"><X className="w-4.5 h-4.5 text-muted-foreground" /></button>
                </div>

                {/* Profile Card */}
                <div className="flex flex-col items-center text-center pb-6 border-b border-border/50 mb-6">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-3xl font-extrabold text-primary border border-primary/20 shadow-sm mb-4">
                    {getInitials(selectedCustomer.name)}
                  </div>
                  <h4 className="font-display text-xl font-bold text-foreground">{selectedCustomer.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 ${
                    selectedCustomer.customer_type === 'Registered' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {selectedCustomer.customer_type} Customer
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-secondary/40 p-4 rounded-2xl border border-border/40 text-center">
                    <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total Spent</span>
                    <p className="text-base font-bold text-foreground mt-1">PKR {selectedCustomer.total_spent.toLocaleString()}</p>
                  </div>
                  <div className="bg-secondary/40 p-4 rounded-2xl border border-border/40 text-center">
                    <ShoppingCart className="w-4 h-4 text-accent mx-auto mb-1" />
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total Orders</span>
                    <p className="text-base font-bold text-foreground mt-1">{selectedCustomer.order_count}</p>
                  </div>
                </div>

                {/* Contact & Address Details */}
                <div className="bg-secondary/20 rounded-2xl p-4 border border-border/40 space-y-3 mb-6 text-sm">
                  <h5 className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Contact Details</h5>
                  <p className="flex items-center gap-2"><Mail className="w-4.5 h-4.5 text-muted-foreground/80" /> <span className="text-foreground">{selectedCustomer.email}</span></p>
                  <p className="flex items-center gap-2"><Phone className="w-4.5 h-4.5 text-muted-foreground/80" /> <span className="text-foreground">{selectedCustomer.phone}</span></p>
                  <p className="flex items-center gap-2 items-start"><MapPin className="w-4.5 h-4.5 text-muted-foreground/80 mt-0.5" /> <span className="text-foreground leading-relaxed">{selectedCustomer.address}, {selectedCustomer.city}</span></p>
                </div>

                {/* Order History list */}
                <div className="flex-1 flex flex-col min-h-0">
                  <h5 className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-3">Order History</h5>
                  <div className="space-y-2 overflow-y-auto pr-1 flex-1 scrollbar-none">
                    {selectedCustomer.orders.map((ord: any) => (
                      <div key={ord.id} className="p-3 bg-secondary/30 rounded-xl border border-border/40 flex items-center justify-between text-xs hover:bg-secondary/40 transition-colors">
                        <div>
                          <p className="font-semibold text-foreground">Order #{ord.id.slice(0, 8)}</p>
                          <p className="text-muted-foreground mt-0.5">{new Date(ord.date).toLocaleDateString()} • {ord.itemsCount} item(s)</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">PKR {ord.total.toLocaleString()}</p>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded capitalize ${
                            ord.status === 'delivered' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                          }`}>{ord.status}</span>
                        </div>
                      </div>
                    ))}
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

export default AdminCustomers;
