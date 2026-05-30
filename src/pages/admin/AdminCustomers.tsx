import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Users, Search, ShoppingCart, DollarSign } from "lucide-react";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/orders');
      const json = await resp.json();
      const orders = json.orders || [];

      const userMap: Record<string, any> = {};
      orders.forEach((o: any) => {
        if (!o.user?.id) return;
        const uid = o.user.id;
        if (!userMap[uid]) {
          userMap[uid] = {
            user_id: uid,
            total_spent: 0,
            order_count: 0,
            last_order: o.createdAt,
            email: o.user.email || o.shipping?.email || 'N/A',
            name: o.user.name || `${o.shipping?.firstName || ''} ${o.shipping?.lastName || ''}`.trim() || 'Unknown',
            city: o.shipping?.city || 'N/A',
          };
        }
        userMap[uid].total_spent += o.total || 0;
        userMap[uid].order_count += 1;
        if (new Date(userMap[uid].last_order) < new Date(o.createdAt)) userMap[uid].last_order = o.createdAt;
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
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">{customers.length} customers from orders</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 bg-card rounded-xl border border-border max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
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
                  <tr key={c.user_id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {c.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <span className="font-medium text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{c.email}</td>
                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{c.city}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <ShoppingCart className="w-3 h-3" /> {c.order_count}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-foreground">PKR {c.total_spent.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground hidden lg:table-cell">{new Date(c.last_order).toLocaleDateString()}</td>
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
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
