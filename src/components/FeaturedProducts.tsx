import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { mapProduct } from "@/pages/ShopPage";
import ProductCard from "./ProductCard";

const FeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [active, setActive] = useState("All");

  useEffect(() => {
    const fetch = async () => {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }).limit(12),
        supabase.from("categories").select("name").order("sort_order"),
      ]);
      setProducts((prods || []).map(mapProduct));
      setCategories(["All", ...(cats || []).map((c: any) => c.name)]);
    };
    fetch();
  }, []);

  const filtered = active === "All" ? products : products.filter((p) => p.category === active);

  return (
    <section id="featured" className="section-padding container-tight">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-12">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-8 h-px bg-primary" />
          <span className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-primary">Our Collection</span>
          <div className="w-8 h-px bg-primary" />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground mt-2">Featured Products</h2>
        <p className="text-muted-foreground mt-3 sm:mt-4 max-w-md mx-auto text-sm sm:text-base">
          Handpicked kitchen essentials designed to make cooking effortless and enjoyable.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              active === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
