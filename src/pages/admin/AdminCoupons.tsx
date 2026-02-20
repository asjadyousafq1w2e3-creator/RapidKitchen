import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Edit2, Trash2, X, Save, Percent, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("Coupon deleted");
    fetchCoupons();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("coupons").update({ is_active: !current }).eq("id", id);
    toast.success(current ? "Coupon deactivated" : "Coupon activated");
    fetchCoupons();
  };

  const handleSave = async (coupon: any) => {
    const payload = {
      code: coupon.code.toUpperCase(),
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      min_order_amount: Number(coupon.min_order_amount) || 0,
      max_uses: coupon.max_uses ? Number(coupon.max_uses) : null,
      is_active: coupon.is_active,
      expires_at: coupon.expires_at || null,
    };

    if (coupon.id) {
      const { error } = await supabase.from("coupons").update(payload).eq("id", coupon.id);
      if (error) { toast.error("Failed: " + error.message); return; }
      toast.success("Coupon updated");
    } else {
      const { error } = await supabase.from("coupons").insert(payload);
      if (error) { toast.error("Failed: " + error.message); return; }
      toast.success("Coupon created");
    }
    setShowForm(false);
    setEditing(null);
    fetchCoupons();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl text-foreground">Coupons</h1>
            <p className="text-sm text-muted-foreground mt-1">{coupons.length} coupons</p>
          </div>
          <button
            onClick={() => { setEditing({ code: "", discount_type: "percentage", discount_value: 10, min_order_amount: 0, max_uses: null, is_active: true, expires_at: "" }); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Add Coupon
          </button>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && editing && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => { setShowForm(false); setEditing(null); }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                className="bg-card rounded-2xl p-6 shadow-elevated w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <CouponForm coupon={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Coupons Table */}
        <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Code</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Discount</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden sm:table-cell">Min Order</th>
                  <th className="text-center py-3 px-4 text-xs text-muted-foreground font-medium hidden md:table-cell">Usage</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden lg:table-cell">Expires</th>
                  <th className="text-center py-3 px-4 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-xs text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-foreground bg-secondary px-2 py-1 rounded">{c.code}</span>
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {c.discount_type === "percentage" ? `${c.discount_value}%` : `PKR ${Number(c.discount_value).toLocaleString()}`}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">PKR {c.min_order_amount?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground hidden md:table-cell">
                      {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : " / ∞"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => toggleActive(c.id, c.is_active)} title={c.is_active ? "Active" : "Inactive"}>
                        {c.is_active ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">Active</span>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground font-medium">Inactive</span>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(c); setShowForm(true); }} className="p-2 rounded-lg hover:bg-secondary"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-destructive" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <Percent className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No coupons yet
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

const CouponForm = ({ coupon, onSave, onCancel }: any) => {
  const [form, setForm] = useState({ ...coupon });
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-foreground">{coupon.id ? "Edit" : "New"} Coupon</h3>
        <button type="button" onClick={onCancel} className="p-2 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Coupon Code *</label>
        <input required value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="e.g. SAVE20" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary font-mono" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Type</label>
          <select value={form.discount_type} onChange={(e) => set("discount_type", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary">
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (PKR)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Value *</label>
          <input required type="number" value={form.discount_value} onChange={(e) => set("discount_value", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Min Order (PKR)</label>
          <input type="number" value={form.min_order_amount} onChange={(e) => set("min_order_amount", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Max Uses</label>
          <input type="number" value={form.max_uses || ""} onChange={(e) => set("max_uses", e.target.value)} placeholder="Unlimited" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary" />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Expires At</label>
        <input type="date" value={form.expires_at ? form.expires_at.slice(0, 10) : ""} onChange={(e) => set("expires_at", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm">Cancel</button>
        <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> {coupon.id ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default AdminCoupons;
