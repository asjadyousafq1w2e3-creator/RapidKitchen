import { useState } from "react";
import { motion } from "framer-motion";
import { products, categories } from "@/data/products";
import ProductCard from "./ProductCard";

const FeaturedProducts = () => {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? products : products.filter((p) => p.category === active);

  return (
    <section id="featured" className="section-padding container-tight">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <span className="text-sm font-medium tracking-widest uppercase text-primary">
          Our Collection
        </span>
        <h2 className="font-display text-4xl sm:text-5xl text-foreground mt-3">
          Featured Products
        </h2>
        <p className="text-muted-foreground mt-4 max-w-md mx-auto">
          Handpicked kitchen essentials designed to make cooking effortless and enjoyable.
        </p>
      </motion.div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              active === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
