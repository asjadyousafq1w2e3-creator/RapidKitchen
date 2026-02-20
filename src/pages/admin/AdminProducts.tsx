import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Plus, Edit2, Trash2, X, Save, Search, Filter, Eye, Package,
  ChevronDown, Upload, Image as ImageIcon, Loader2
} from "lucide-react";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const emptyProduct = {
  name: "", slug: "", price: 0, original_price: null, description: "",
  short_description: "", images: [] as string[], category: "General",
  features: [] as string[], in_stock: true, stock_quantity: 100,
  badge: "", colors: null as string[] | null, rating: 0, review_count: 0,
};

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStock, setFilterStock] = useState<"all" | "in" | "out">("all");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    setProducts(prods || []);
    setCategories(cats || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Product deleted");
    fetchAll();
  };

  const handleSave = async (product: any) => {
    const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const images = typeof product.images === "string"
      ? product.images.split(",").map((s: string) => s.trim()).filter(Boolean)
      : product.images;
    const features = typeof product.features === "string"
      ? product.features.split(",").map((s: string) => s.trim()).filter(Boolean)
      : product.features;
    const colors = product.colors
      ? (typeof product.colors === "string"
        ? product.colors.split(",").map((s: string) => s.trim()).filter(Boolean)
        : product.colors)
      : null;

    const payload = {
      name: product.name,
      slug,
      price: Number(product.price),
      original_price: product.original_price ? Number(product.original_price) : null,
      description: product.description || "",
      short_description: product.short_description || "",
      images,
      category: product.category || "General",
      features,
      in_stock: product.in_stock,
      stock_quantity: Number(product.stock_quantity) || 0,
      badge: product.badge || null,
      colors,
      rating: Number(product.rating) || 0,
      review_count: Number(product.review_count) || 0,
    };

    if (product.id) {
      const { error } = await supabase.from("products").update(payload).eq("id", product.id);
      if (error) { toast.error("Failed to update: " + error.message); return; }
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error("Failed to create: " + error.message); return; }
      toast.success("Product created");
    }
    setShowForm(false);
    setEditing(null);
    fetchAll();
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "All" || p.category === filterCategory;
    const matchStock = filterStock === "all" || (filterStock === "in" ? p.in_stock : !p.in_stock);
    return matchSearch && matchCategory && matchStock;
  });

  const uniqueCategories = ["All", ...new Set(products.map((p) => p.category))];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground mt-1">{products.length} total products</p>
          </div>
          <button
            onClick={() => { setEditing({ ...emptyProduct }); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-card rounded-xl border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-card rounded-xl border border-border text-sm text-foreground outline-none"
          >
            {uniqueCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value as any)}
            className="px-4 py-2.5 bg-card rounded-xl border border-border text-sm text-foreground outline-none"
          >
            <option value="all">All Stock</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        {/* Product Form Modal */}
        <AnimatePresence>
          {showForm && editing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
              onClick={() => { setShowForm(false); setEditing(null); }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="bg-card rounded-2xl p-6 shadow-elevated w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <ProductForm
                  product={editing}
                  categories={categories}
                  onSave={handleSave}
                  onCancel={() => { setShowForm(false); setEditing(null); }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Table */}
        <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Product</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden sm:table-cell">Category</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium">Price</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden md:table-cell">Stock</th>
                  <th className="text-left py-3 px-4 text-xs text-muted-foreground font-medium hidden lg:table-cell">Status</th>
                  <th className="text-right py-3 px-4 text-xs text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || ""} alt="" className="w-10 h-10 rounded-lg object-cover bg-secondary" />
                        <div>
                          <p className="font-medium text-foreground">{p.name}</p>
                          {p.badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">{p.badge}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{p.category}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-foreground">PKR {p.price?.toLocaleString()}</span>
                      {p.original_price && (
                        <span className="text-xs text-muted-foreground line-through ml-1">PKR {p.original_price?.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{p.stock_quantity}</td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.in_stock ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                        {p.in_stock ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditing(p); setShowForm(true); }}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No products found
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

const uploadImage = async (file: File): Promise<string | null> => {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(fileName, file, { contentType: file.type });
  if (error) {
    toast.error("Upload failed: " + error.message);
    return null;
  }
  return `${SUPABASE_URL}/storage/v1/object/public/product-images/${data.path}`;
};

const ProductForm = ({
  product, categories, onSave, onCancel
}: { product: any; categories: any[]; onSave: (p: any) => void; onCancel: () => void }) => {
  const [form, setForm] = useState({ ...product });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const set = (key: string, value: any) => setForm({ ...form, [key]: value });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const currentImages = Array.isArray(form.images) ? [...form.images] : [];

    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) currentImages.push(url);
    }

    set("images", currentImages);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    const imgs = Array.isArray(form.images) ? [...form.images] : [];
    imgs.splice(index, 1);
    set("images", imgs);
  };

  const currentImages = Array.isArray(form.images) ? form.images : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-foreground">{product.id ? "Edit Product" : "New Product"}</h3>
        <button type="button" onClick={onCancel} className="p-2 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Product Name *" value={form.name} onChange={(v) => set("name", v)} required />
        <FormField label="Slug" value={form.slug} onChange={(v) => set("slug", v)} placeholder="auto-generated" />
        <FormField label="Price (PKR) *" value={form.price} onChange={(v) => set("price", v)} type="number" required />
        <FormField label="Original Price" value={form.original_price || ""} onChange={(v) => set("original_price", v)} type="number" />
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Category *</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
          >
            {categories.length > 0 ? (
              categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)
            ) : (
              <option value="General">General</option>
            )}
          </select>
        </div>
        <FormField label="Badge" value={form.badge || ""} onChange={(v) => set("badge", v)} placeholder="e.g. Best Seller, New" />
        <FormField label="Stock Quantity" value={form.stock_quantity} onChange={(v) => set("stock_quantity", v)} type="number" />
        <FormField label="Rating (0-5)" value={form.rating} onChange={(v) => set("rating", v)} type="number" />
        <FormField label="Review Count" value={form.review_count} onChange={(v) => set("review_count", v)} type="number" />
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">In Stock</label>
          <button
            type="button"
            onClick={() => set("in_stock", !form.in_stock)}
            className={`w-10 h-6 rounded-full transition-colors ${form.in_stock ? "bg-primary" : "bg-border"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-primary-foreground transition-transform mx-1 ${form.in_stock ? "translate-x-4" : ""}`} />
          </button>
        </div>
      </div>

      <FormField label="Short Description" value={form.short_description || ""} onChange={(v) => set("short_description", v)} />

      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Description</label>
        <textarea
          value={form.description || ""}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary resize-none"
        />
      </div>

      {/* Image Upload Section */}
      <div>
        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">Product Images</label>
        
        {/* Current Images Preview */}
        {currentImages.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {currentImages.map((img: string, i: number) => (
              <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-border bg-secondary">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4 text-destructive-foreground" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-[9px] text-center py-0.5">Main</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Button & URL Input */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary text-sm text-muted-foreground hover:text-primary transition-all disabled:opacity-50"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-4 h-4" /> Upload Images</>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">or</span>
            <input
              type="text"
              placeholder="Paste image URL and press Enter"
              className="flex-1 px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const input = e.currentTarget;
                  const url = input.value.trim();
                  if (url) {
                    set("images", [...currentImages, url]);
                    input.value = "";
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <FormField
        label="Features (comma-separated)"
        value={Array.isArray(form.features) ? form.features.join(", ") : form.features || ""}
        onChange={(v) => set("features", v)}
      />
      <FormField
        label="Colors (comma-separated, optional)"
        value={Array.isArray(form.colors) ? form.colors.join(", ") : form.colors || ""}
        onChange={(v) => set("colors", v)}
      />

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm">
          Cancel
        </button>
        <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> {product.id ? "Update" : "Create"} Product
        </button>
      </div>
    </form>
  );
};

const FormField = ({
  label, value, onChange, type = "text", required = false, placeholder = ""
}: { label: string; value: any; onChange: (v: any) => void; type?: string; required?: boolean; placeholder?: string }) => (
  <div>
    <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
      required={required}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
    />
  </div>
);

export default AdminProducts;
