import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, User, ChevronRight, ChefHat, CupSoda, Scissors, Scale, Sprout, Package, Grid3X3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Choppers: ChefHat,
  Blenders: CupSoda,
  Knives: Scissors,
  Drinkware: CupSoda,
  Measurement: Scale,
  Garden: Sprout,
  General: Package,
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, setIsOpen, justAdded } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("name, slug").order("sort_order");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const navLinks = [
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass-card shadow-soft py-3"
            : "bg-background/80 backdrop-blur-md py-4 sm:py-5"
        }`}
      >
        <div className="container-tight flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="font-display text-xl sm:text-2xl tracking-tight text-foreground">
              Chef<span className="text-primary">Ease</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`text-sm font-medium transition-colors relative group ${
                  location.pathname === link.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                  location.pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                }`} />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-2 rounded-full hover:bg-secondary transition-colors">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </button>

            <Link
              to={user ? "/account" : "/auth"}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            </Link>

            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 rounded-full hover:bg-secondary transition-colors"
            >
              <ShoppingBag className={`w-4 h-4 sm:w-5 sm:h-5 text-foreground transition-transform ${justAdded ? "animate-cart-bounce" : ""}`} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-accent text-accent-foreground text-[10px] sm:text-xs flex items-center justify-center font-bold"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-foreground/30 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-[70] w-[280px] bg-background shadow-elevated md:hidden overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Link to="/" className="font-display text-xl tracking-tight text-foreground" onClick={() => setMobileOpen(false)}>
                  Chef<span className="text-primary">Ease</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full hover:bg-secondary transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between py-3 px-3 rounded-xl text-sm font-medium transition-colors ${
                      location.pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    {link.label}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
              </nav>

              {/* Categories */}
              <div className="px-4 pb-2">
                <div className="flex items-center gap-2 mb-3">
                  <Grid3X3 className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Shop by Category</h3>
                </div>
                <div className="space-y-0.5">
                  {categories.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.name] || Package;
                    const isActive = location.pathname === `/category/${cat.slug}`;
                    return (
                      <Link
                        key={cat.slug}
                        to={`/category/${cat.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground hover:bg-secondary"
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive ? "bg-primary/20" : "bg-secondary"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="flex-1">{cat.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Account */}
              <div className="p-4 mt-2 border-t border-border">
                <Link
                  to={user ? "/account" : "/auth"}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-3 px-3 rounded-xl text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </span>
                  {user ? "My Account" : "Sign In / Sign Up"}
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
