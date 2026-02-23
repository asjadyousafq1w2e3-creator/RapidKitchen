import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SlidersHorizontal, Grid2X2, LayoutList } from "lucide-react";

const ShopPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [active, setActive] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [gridView, setGridView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("name").order("sort_order"),
      ]);
      setProducts((prods || []).map(mapProduct));
      setCategories(["All", ...(cats || []).map((c: any) => c.name)]);
      setLoading(false);
    };
    fetchData();
  }, []);

  let filtered = active === "All" ? products : products.filter((p) => p.category === active);

  if (sortBy === "price-low") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-high") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-tight px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl text-foreground mb-2">Shop All</h1>
            <p className="text-muted-foreground text-sm">Showing {filtered.length} products</p>
          </motion.div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${active === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-secondary rounded-xl p-1">
                <button onClick={() => setGridView("grid")} className={`p-1.5 rounded-lg transition-colors ${gridView === "grid" ? "bg-background shadow-soft" : ""}`}>
                  <Grid2X2 className="w-4 h-4 text-foreground" />
                </button>
                <button onClick={() => setGridView("list")} className={`p-1.5 rounded-lg transition-colors ${gridView === "list" ? "bg-background shadow-soft" : ""}`}>
                  <LayoutList className="w-4 h-4 text-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-1.5">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-sm text-foreground outline-none">
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : (
            <div className={gridView === "grid" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

// Map DB product to component format
export const mapProduct = (p: any) => ({
  id: p.slug || p.id,
  dbId: p.id,
  name: p.name,
  price: p.price,
  originalPrice: p.original_price,
  description: p.description,
  shortDescription: p.short_description,
  images: p.images || [],
  category: p.category,
  rating: Number(p.rating) || 0,
  reviewCount: p.review_count || 0,
  badge: p.badge,
  colors: p.colors,
  inStock: p.in_stock,
  features: p.features || [],
  metaTitle: p.meta_title,
  metaDescription: p.meta_description,
  metaKeywords: p.meta_keywords,
});

export default ShopPage;
