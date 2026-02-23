import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag, ArrowLeft, Truck, RotateCcw, Shield, Check, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import ReviewSection from "@/components/ReviewSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mapProduct } from "./ShopPage";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">("description");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      // Try to find by slug first, then by id
      let { data } = await supabase.from("products").select("*").eq("slug", id).maybeSingle();
      if (!data) {
        const res = await supabase.from("products").select("*").eq("id", id).maybeSingle();
        data = res.data;
      }
      if (data) {
        setProduct(mapProduct(data));
        // Fetch related products
        const { data: rel } = await supabase
          .from("products")
          .select("*")
          .eq("category", data.category)
          .neq("id", data.id)
          .limit(3);
        setRelated((rel || []).map(mapProduct));
      }
      setLoading(false);
    };
    fetchProduct();
    setSelectedImage(0);
    setSelectedColor(0);
    setQuantity(1);
    setActiveTab("description");
  }, [id]);

  useEffect(() => {
    if (product) {
      const title = product.metaTitle || product.name;
      const description = product.metaDescription || product.shortDescription || product.description?.substring(0, 160) || "";
      const keywords = product.metaKeywords || `${product.name}, ${product.category}, buy ${product.name}, buy online`;

      document.title = title;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);

      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', keywords);
    }
  }, [product]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container-tight px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square rounded-3xl bg-secondary animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 bg-secondary rounded animate-pulse" />
                <div className="h-6 w-1/2 bg-secondary rounded animate-pulse" />
                <div className="h-20 bg-secondary rounded animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl text-foreground mb-4">Product not found</h1>
            <Link to="/shop" className="text-primary hover:underline">← Back to shop</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleAdd = () => {
    addItem(product, quantity, product.colors?.[selectedColor]);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, product.colors?.[selectedColor]);
    navigate("/checkout");
  };

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-tight px-4 sm:px-6 lg:px-8">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>

          {/* TOP SECTION: Image + Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Image */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="aspect-square rounded-3xl overflow-hidden bg-secondary shadow-soft">
                <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === i ? "border-primary" : "border-transparent"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Right: Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
              <div>
                <p className="text-sm text-primary uppercase tracking-widest mb-2">{product.category}</p>
                <h1 className="font-display text-3xl sm:text-4xl text-foreground">{product.name}</h1>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.round(product.rating) ? "text-accent" : "text-muted"}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg></span>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span>
                </div>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">PKR {product.price.toLocaleString()}</span>
                {product.originalPrice && <span className="text-lg text-muted-foreground line-through">PKR {product.originalPrice.toLocaleString()}</span>}
              </div>

              {/* Short Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.shortDescription || (product.description ? product.description.substring(0, 150) + "..." : "")}
              </p>

              {product.colors && product.colors.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Color: {product.colors[selectedColor]}</p>
                  <div className="flex gap-2">
                    {product.colors.map((_: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(i)}
                        className={`px-4 py-2 rounded-xl text-sm border transition-all ${selectedColor === i ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:border-primary"}`}
                      >
                        {product.colors[i]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-secondary rounded-2xl p-1">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center hover:bg-muted transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center hover:bg-muted transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleAdd}
                    className={`flex-1 inline-flex items-center justify-center gap-2 h-14 sm:h-14 rounded-2xl font-medium text-base transition-all shadow-soft ${added ? "bg-primary text-primary-foreground" : "bg-primary text-primary-foreground hover:opacity-90"}`}
                  >
                    {added ? (<><Check className="w-5 h-5" /> Added!</>) : (<><ShoppingBag className="w-5 h-5" /> Add to Cart</>)}
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full inline-flex items-center justify-center gap-2 h-14 sm:h-14 rounded-2xl bg-accent text-accent-foreground font-medium text-base hover:opacity-90 transition-all shadow-soft"
                >
                  <CreditCard className="w-5 h-5" /> Buy Now
                </button>
              </div>

              <div className="space-y-3 pt-6 border-t border-border">
                {[
                  { icon: Truck, text: "Free shipping on orders above PKR 3,500" },
                  { icon: RotateCcw, text: "30-day hassle-free returns" },
                  { icon: Shield, text: "1-year manufacturer warranty" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <item.icon className="w-4 h-4 text-primary flex-shrink-0" /> {item.text}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* BOTTOM SECTION: Details Tabs */}
          <div className="mt-20 lg:mt-32">
            {/* Tabs Header */}
            <div className="flex flex-wrap gap-6 sm:gap-10 border-b border-border">
              {(["description", "specifications", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-base sm:text-lg font-medium capitalize transition-colors relative -mb-px ${activeTab === tab
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabBadge"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tabs Content */}
            <div className="py-8 min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === "description" && (
                  <motion.div
                    key="description"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="font-display text-2xl text-foreground mb-6">Product Description</h3>
                    <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
                      <p className="leading-relaxed whitespace-pre-wrap">{product.description}</p>
                    </div>
                  </motion.div>
                )}

                {activeTab === "specifications" && (
                  <motion.div
                    key="specifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="font-display text-2xl text-foreground mb-6">Key Features & Specifications</h3>
                    {product.features && product.features.length > 0 ? (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.features.map((f: string, i: number) => (
                          <li key={i} className="flex items-start gap-3 text-muted-foreground p-4 bg-secondary/30 rounded-2xl">
                            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{f}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No specific features listed for this product.</p>
                    )}
                  </motion.div>
                )}

                {activeTab === "reviews" && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="-mt-16 sm:-mt-24">
                      {/* Offset margin since ReviewSection has top margin internally */}
                      <ReviewSection productId={product.id} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RELATED PRODUCTS */}
          {related.length > 0 && (
            <div className="mt-16 pt-16 border-t border-border">
              <h2 className="font-display text-3xl text-foreground mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProductPage;
