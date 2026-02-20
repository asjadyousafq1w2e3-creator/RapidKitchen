import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { mapProduct } from "@/pages/ShopPage";
import ProductCard from "./ProductCard";

const BestSellers = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .or("badge.eq.Best Seller,badge.eq.Top Rated")
      .limit(6)
      .then(({ data }) => setProducts((data || []).map(mapProduct)));
  }, []);

  if (products.length === 0) return null;

  return (
    <section id="bestsellers" className="section-padding bg-secondary/50">
      <div className="container-tight">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="text-sm font-medium tracking-widest uppercase text-accent">Most Popular</span>
          <h2 className="font-display text-4xl sm:text-5xl text-foreground mt-3">Best Sellers</h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">The products our customers love the most. Tried, tested, and trusted.</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
