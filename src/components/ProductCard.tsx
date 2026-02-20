import { motion } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addItem } = useCart();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative bg-card rounded-3xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-500"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Badges */}
        {product.badge && (
          <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full bg-accent text-accent-foreground">
            {product.badge}
          </span>
        )}
        {discount && (
          <span className="absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full bg-destructive text-destructive-foreground">
            -{discount}%
          </span>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
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
      <div className="p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
          {product.shortDescription}
        </p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-lg">
              PKR {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                PKR {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-accent">★</span>
            <span className="text-muted-foreground">{product.rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
