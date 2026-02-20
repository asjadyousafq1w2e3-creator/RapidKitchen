import { memo } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = memo(({ product, index = 0 }: ProductCardProps) => {
  const { addItem } = useCart();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}
      className="group relative bg-card rounded-2xl sm:rounded-3xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] sm:aspect-square overflow-hidden bg-secondary">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          width={400}
          height={400}
        />

        {/* Badges */}
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between">
          {product.badge ? (
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full bg-accent text-accent-foreground">
              {product.badge}
            </span>
          ) : <span />}
          {discount ? (
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full bg-destructive text-destructive-foreground">
              -{discount}%
            </span>
          ) : null}
        </div>

        {/* Hover Actions - desktop only */}
        <div className="hidden sm:flex absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-all duration-300 items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="p-3 rounded-full bg-background/90 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-soft"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
          <Link
            to={`/product/${product.id}`}
            className="p-3 rounded-full bg-background/90 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-soft"
          >
            <Eye className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-5">
        <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">
          {product.category}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display text-sm sm:text-lg text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 hidden sm:block">
          {product.shortDescription}
        </p>
        <div className="flex items-center justify-between mt-2 sm:mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
            <span className="font-bold text-foreground text-sm sm:text-lg">
              PKR {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-sm text-muted-foreground line-through">
                PKR {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm">
            <span className="text-accent">★</span>
            <span className="text-muted-foreground">{product.rating}</span>
          </div>
        </div>

        {/* Mobile Add to Cart */}
        <button
          onClick={() => addItem(product)}
          className="sm:hidden w-full mt-2 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
