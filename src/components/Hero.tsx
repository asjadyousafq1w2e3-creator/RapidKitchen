import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag, Star, Truck, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import heroImage1 from "@/assets/hero-kitchen.jpg";
import heroImage2 from "@/assets/hero-slide-2.jpg";
import heroImage3 from "@/assets/hero-slide-3.jpg";

// Pick 3 star products to feature
const featuredProducts = [
  products.find((p) => p.id === "aero-blend-mixer")!,
  products.find((p) => p.id === "smart-chopper-pro")!,
  products.find((p) => p.id === "ceramic-knife-set")!,
];

const slides = [
  {
    bg: heroImage1,
    product: featuredProducts[0],
    tag: "🔥 Top Rated — 312 Reviews",
    headingLine1: "Blend Smarter,",
    headingAccent: "Not Harder",
    highlight: "Save PKR 2,000",
    urgency: "Only 12 left in stock",
  },
  {
    bg: heroImage2,
    product: featuredProducts[1],
    tag: "⭐ Best Seller — 234 Reviews",
    headingLine1: "Chop, Mince,",
    headingAccent: "Done in Seconds",
    highlight: "31% OFF",
    urgency: "Free shipping today",
  },
  {
    bg: heroImage3,
    product: featuredProducts[2],
    tag: "🏆 Chef's Favorite",
    headingLine1: "Cut Like a",
    headingAccent: "Master Chef",
    highlight: "Save PKR 1,700",
    urgency: "Includes knife block",
  },
];

const SLIDE_DURATION = 7000;

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [[current, direction], setCurrent] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);
  const { addItem } = useCart();

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const paginate = useCallback(
    (dir: number) => setCurrent(([prev]) => [(prev + dir + slides.length) % slides.length, dir]),
    []
  );

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => paginate(1), SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isPaused, paginate]);

  const slide = slides[current];
  const product = slide.product;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <section
      ref={ref}
      className="relative min-h-[92vh] sm:min-h-screen flex items-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background */}
      <motion.div style={{ y: parallaxY }} className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.img
            key={current}
            src={slide.bg}
            alt=""
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1.04, transition: { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] as const } }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="absolute inset-0 w-full h-full object-cover"
            loading={current === 0 ? "eager" : "lazy"}
            fetchPriority={current === 0 ? "high" : "auto"}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20 sm:from-background/95 sm:via-background/65 sm:to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent z-10" />
      </motion.div>

      {/* Content */}
      <motion.div style={{ opacity: contentOpacity }} className="relative z-20 section-padding container-tight w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left — Text & CTA */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={current} custom={direction} initial="enter" animate="center" exit="exit">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/15 border border-accent/30 mb-5"
              >
                <span className="text-xs sm:text-sm font-semibold text-accent">{slide.tag}</span>
              </motion.div>

              {/* Heading */}
              <motion.h1 className="font-display text-3xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] text-foreground mb-4 sm:mb-5">
                <motion.span
                  initial={{ opacity: 0, y: 50, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  {slide.headingLine1}
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 50, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="block text-primary italic"
                >
                  {slide.headingAccent}
                </motion.span>
              </motion.h1>

              {/* Product Name & Price */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mb-5 sm:mb-6"
              >
                <p className="text-sm sm:text-base text-muted-foreground mb-3">{product.shortDescription}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                    PKR {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      PKR {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-bold">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "text-accent fill-accent" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              </motion.div>

              {/* Urgency line */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex items-center gap-2 mb-6 sm:mb-8"
              >
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">{slide.urgency}</span>
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={() => addItem(product)}
                  className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-accent text-accent-foreground font-bold text-sm sm:text-base hover:brightness-110 transition-all shadow-elevated group"
                >
                  <ShoppingBag className="w-4.5 h-4.5" />
                  Add to Cart — PKR {product.price.toLocaleString()}
                </button>
                <Link
                  to={`/product/${product.id}`}
                  className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-primary text-primary-foreground font-medium text-sm sm:text-base hover:opacity-90 transition-all shadow-soft group"
                >
                  View Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              {/* Trust bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-muted-foreground"
              >
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  <span>Free Shipping 3K+</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span>1-Year Warranty</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary">↩</span>
                  <span>30-Day Returns</span>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Right — Floating Product Image Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 80, rotateY: -15, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, x: -60, scale: 0.9 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block"
            >
              <Link to={`/product/${product.id}`} className="block group relative">
                <div className="relative rounded-3xl overflow-hidden shadow-elevated bg-card border border-border/50">
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-soft">
                        {product.badge}
                      </span>
                    </div>
                  )}
                  {/* Discount tag */}
                  {discount > 0 && (
                    <div className="absolute top-4 right-4 z-20">
                      <span className="px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                        -{discount}%
                      </span>
                    </div>
                  )}
                  {/* Product image */}
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  </div>
                  {/* Bottom info strip */}
                  <div className="p-5 bg-card">
                    <h3 className="font-display text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{product.shortDescription}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-foreground">
                          PKR {product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            PKR {product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Glow effect behind card */}
                <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] -z-10 blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Navigation Arrows */}
      <div className="absolute right-4 sm:right-8 bottom-20 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-30 flex sm:flex-col gap-2">
        <button
          onClick={() => paginate(-1)}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-card flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={() => paginate(1)}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-card flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent([i, i > current ? 1 : -1])}
            className="relative h-1.5 rounded-full overflow-hidden transition-all duration-500"
            style={{ width: i === current ? 48 : 16 }}
            aria-label={`Go to slide ${i + 1}`}
          >
            <div className="absolute inset-0 bg-foreground/20 rounded-full" />
            {i === current && (
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                key={`progress-${current}`}
                className="absolute inset-y-0 left-0 bg-primary rounded-full"
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
