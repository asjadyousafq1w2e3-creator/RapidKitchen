import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Edit2, Trash2, X, Save, FolderTree } from "lucide-react";
import { toast } from "sonner";

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
    setCategories(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Category deleted");
    fetchCategories();
  };

  const handleSave = async (cat: any) => {
    const slug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload = { name: cat.name, slug, description: cat.description || "", image: cat.image || "", sort_order: Number(cat.sort_order) || 0, parent_id: cat.parent_id || null };

    if (cat.id) {
      const { error } = await supabase.from("categories").update(payload).eq("id", cat.id);
      if (error) { toast.error("Failed: " + error.message); return; }
      toast.success("Category updated");
    } else {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) { toast.error("Failed: " + error.message); return; }
      toast.success("Category created");
    }
    setShowForm(false);
    setEditing(null);
    fetchCategories();
  };

  // Count products per category
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    supabase.from("products").select("category").then(({ data }) => {
      const counts: Record<string, number> = {};
      (data || []).forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
      setProductCounts(counts);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl text-foreground">Categories</h1>
            <p className="text-sm text-muted-foreground mt-1">{categories.length} categories</p>
          </div>
          <button
            onClick={() => { setEditing({ name: "", slug: "", description: "", image: "", sort_order: 0, parent_id: null }); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Add Category
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
                <CategoryForm category={editing} allCategories={categories} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-card rounded-2xl p-5 shadow-soft">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {cat.image ? (
                    <img src={cat.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FolderTree className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-foreground">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">{productCounts[cat.name] || 0} products</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(cat); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-secondary"><Edit2 className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                </div>
              </div>
              {cat.description && <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>}
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full text-center py-12 bg-card rounded-2xl">
              <FolderTree className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-sm">No categories yet. Add your first category.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const CategoryForm = ({ category, allCategories, onSave, onCancel }: any) => {
  const [form, setForm] = useState({ ...category });
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-foreground">{category.id ? "Edit" : "New"} Category</h3>
        <button type="button" onClick={onCancel} className="p-2 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Name *</label>
        <input required value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Slug</label>
        <input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated" className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Description</label>
        <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary resize-none" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Image URL</label>
        <input value={form.image} onChange={(e) => set("image", e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Sort Order</label>
        <input type="number" value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm">Cancel</button>
        <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> {category.id ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default AdminCategories;
