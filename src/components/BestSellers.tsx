import { motion } from "framer-motion";
import { useBestSellers } from "@/hooks/use-products";
import ProductCard from "./ProductCard";

const BestSellers = () => {
  const { data: products = [] } = useBestSellers();

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
          {products.map((product: any, i: number) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
