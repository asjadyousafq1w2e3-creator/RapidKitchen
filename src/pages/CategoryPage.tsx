import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, SlidersHorizontal, Grid2X2, LayoutList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mapProduct } from "@/pages/ShopPage";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [gridView, setGridView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [{ data: cats }, { data: cat }] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("categories").select("*").eq("slug", slug || "").maybeSingle(),
      ]);

      setAllCategories(cats || []);
      setCategory(cat);

      if (cat) {
        const { data: prods } = await supabase
          .from("products")
          .select("*")
          .eq("category", cat.name)
          .order("created_at", { ascending: false });
        setProducts((prods || []).map(mapProduct));
      }
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  const sorted = [...products];
  if (sortBy === "price-low") sorted.sort((a, b) => a.price - b.price);
  if (sortBy === "price-high") sorted.sort((a, b) => b.price - a.price);
  if (sortBy === "rating") sorted.sort((a, b) => b.rating - a.rating);

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-tight px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{category?.name || slug}</span>
          </div>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl text-foreground mb-2">
              {category?.name || "Category"}
            </h1>
            {category?.description && (
              <p className="text-muted-foreground text-sm max-w-xl">{category.description}</p>
            )}
            <p className="text-muted-foreground text-xs mt-2">
              {sorted.length} {sorted.length === 1 ? "product" : "products"} found
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories */}
            <aside className="lg:w-56 flex-shrink-0">
              <div className="bg-card rounded-2xl p-4 shadow-soft">
                <h3 className="font-display text-sm text-foreground mb-3">Categories</h3>
                <nav className="space-y-1">
                  <Link
                    to="/shop"
                    className="block px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    All Products
                  </Link>
                  {allCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className={`block px-3 py-2 rounded-xl text-sm transition-colors ${
                        cat.slug === slug
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Products */}
            <div className="flex-1">
              {/* Sort bar */}
              <div className="flex items-center justify-between mb-6">
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

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-2xl bg-secondary animate-pulse" />
                  ))}
                </div>
              ) : sorted.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-2xl shadow-soft">
                  <p className="text-muted-foreground mb-4">No products in this category yet</p>
                  <Link to="/shop" className="text-primary font-medium text-sm hover:underline">
                    Browse All Products
                  </Link>
                </div>
              ) : (
                <div className={gridView === "grid" ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                  {sorted.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CategoryPage;
