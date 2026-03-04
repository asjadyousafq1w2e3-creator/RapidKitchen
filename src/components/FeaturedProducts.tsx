import { useState } from "react";
import { motion } from "framer-motion";
import { useProducts, useCategories } from "@/hooks/use-products";
import ProductCard from "./ProductCard";

const FeaturedProducts = () => {
  const { data: products = [] } = useProducts(12);
  const { data: categories = ["All"] } = useCategories();
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? products : products.filter((p: any) => p.category === active);

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

      <div className="flex overflow-x-auto hide-scrollbar sm:flex-wrap justify-start sm:justify-center gap-2 mb-8 sm:mb-10 px-4 sm:px-0">
        {categories.map((cat: string) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`whitespace-nowrap px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${active === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {filtered.map((product: any, i: number) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
