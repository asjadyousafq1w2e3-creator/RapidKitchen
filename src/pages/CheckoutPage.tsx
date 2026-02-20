import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X, Truck, Shield, CreditCard, ArrowRight, ChevronLeft, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FREE_SHIPPING = 3000;

const CheckoutPage = () => {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<"cart" | "shipping" | "payment">("cart");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [shippingData, setShippingData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const shipping = totalPrice >= FREE_SHIPPING ? 0 : 250;
  const discount = couponApplied ? Math.round(totalPrice * 0.1) : 0;
  const total = totalPrice + shipping - discount;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacingOrder(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          total_price: total,
          status: "pending",
          shipping_address: shippingData,
          payment_method: paymentMethod,
        })
        .select()
        .single();
      
      if (error) throw error;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_name: item.product.name,
        product_image: item.product.images[0],
        quantity: item.quantity,
        price: item.product.price,
        color: item.color,
      }));

      await supabase.from("order_items").insert(orderItems);
      setOrderPlaced(true);
    } catch (err) {
      console.error("Order failed:", err);
    }
    setPlacingOrder(false);
  };

  if (orderPlaced) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container-tight px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center py-20"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <span className="text-3xl">✓</span>
              </div>
              <h1 className="font-display text-3xl text-foreground mb-3">Order Placed!</h1>
              <p className="text-muted-foreground mb-2">Thank you for your purchase. Your order #CE-{Math.floor(Math.random() * 90000 + 10000)} has been confirmed.</p>
              <p className="text-sm text-muted-foreground mb-8">You'll receive a confirmation SMS and email shortly.</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all"
              >
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-tight px-4 sm:px-6 lg:px-8">
          {/* Steps */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
            {["Cart", "Shipping", "Payment"].map((s, i) => {
              const stepKey = ["cart", "shipping", "payment"][i];
              const currentIndex = ["cart", "shipping", "payment"].indexOf(step);
              const isActive = i <= currentIndex;
              return (
                <div key={s} className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => i < currentIndex && setStep(stepKey as any)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {i + 1}
                    </span>
                    <span className="hidden sm:inline">{s}</span>
                  </button>
                  {i < 2 && <div className={`w-8 sm:w-16 h-px ${isActive ? "bg-primary" : "bg-border"}`} />}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {step === "cart" && (
                  <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <h2 className="font-display text-2xl text-foreground mb-6">Shopping Cart ({items.length})</h2>
                    {items.length === 0 ? (
                      <div className="text-center py-16 bg-card rounded-2xl">
                        <p className="text-muted-foreground mb-4">Your cart is empty</p>
                        <Link to="/" className="text-primary font-medium text-sm hover:underline">Browse Products</Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.product.id} className="flex gap-4 p-4 bg-card rounded-2xl shadow-soft">
                            <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover" />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="font-medium text-sm text-foreground">{item.product.name}</h3>
                                  <p className="text-xs text-muted-foreground mt-0.5">{item.color || item.product.category}</p>
                                </div>
                                <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2 bg-secondary rounded-xl p-0.5">
                                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted"><Minus className="w-3 h-3" /></button>
                                  <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted"><Plus className="w-3 h-3" /></button>
                                </div>
                                <span className="font-bold text-sm text-foreground">PKR {(item.product.price * item.quantity).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Coupon */}
                        <div className="flex gap-2">
                          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-card rounded-xl border border-border">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="Discount code"
                              value={coupon}
                              onChange={(e) => setCoupon(e.target.value)}
                              className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                            />
                          </div>
                          <button
                            onClick={() => coupon && setCouponApplied(true)}
                            className="px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                        {couponApplied && (
                          <p className="text-sm text-primary font-medium">✓ 10% discount applied!</p>
                        )}

                        <button
                          onClick={() => setStep("shipping")}
                          className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all shadow-soft flex items-center justify-center gap-2"
                        >
                          Continue to Shipping <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === "shipping" && (
                  <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <button onClick={() => setStep("cart")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
                      <ChevronLeft className="w-4 h-4" /> Back to Cart
                    </button>
                    <h2 className="font-display text-2xl text-foreground mb-6">Shipping Details</h2>
                    <div className="space-y-4 bg-card rounded-2xl p-6 shadow-soft">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: "First Name", key: "firstName" },
                          { label: "Last Name", key: "lastName" },
                          { label: "Email", key: "email", type: "email" },
                          { label: "Phone", key: "phone", type: "tel" },
                        ].map((field) => (
                          <div key={field.key}>
                            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">{field.label}</label>
                            <input
                              type={field.type || "text"}
                              value={(shippingData as any)[field.key]}
                              onChange={(e) => setShippingData({ ...shippingData, [field.key]: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                            />
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Address</label>
                        <input
                          type="text"
                          value={shippingData.address}
                          onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { label: "City", key: "city" },
                          { label: "State", key: "state" },
                          { label: "ZIP Code", key: "zip" },
                        ].map((field) => (
                          <div key={field.key}>
                            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">{field.label}</label>
                            <input
                              type="text"
                              value={(shippingData as any)[field.key]}
                              onChange={(e) => setShippingData({ ...shippingData, [field.key]: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setStep("payment")}
                        className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all shadow-soft flex items-center justify-center gap-2 mt-2"
                      >
                        Continue to Payment <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "payment" && (
                  <motion.div key="payment" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <button onClick={() => setStep("shipping")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
                      <ChevronLeft className="w-4 h-4" /> Back to Shipping
                    </button>
                    <h2 className="font-display text-2xl text-foreground mb-6">Payment Method</h2>
                    <form onSubmit={handlePlaceOrder} className="space-y-4">
                      <div className="space-y-3">
                        {[
                          { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive your order", icon: "💵" },
                          { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard accepted", icon: "💳" },
                          { id: "bank", label: "Bank Transfer", desc: "Direct bank transfer", icon: "🏦" },
                          { id: "jazz", label: "JazzCash / EasyPaisa", desc: "Mobile wallet payment", icon: "📱" },
                        ].map((method) => (
                          <label
                            key={method.id}
                            className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                              paymentMethod === method.id
                                ? "bg-primary/5 border-2 border-primary"
                                : "bg-card border-2 border-transparent shadow-soft hover:border-border"
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              value={method.id}
                              checked={paymentMethod === method.id}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="sr-only"
                            />
                            <span className="text-2xl">{method.icon}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{method.label}</p>
                              <p className="text-xs text-muted-foreground">{method.desc}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? "border-primary" : "border-border"}`}>
                              {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                            </div>
                          </label>
                        ))}
                      </div>

                      {/* Trust badges */}
                      <div className="flex flex-wrap items-center justify-center gap-4 py-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> SSL Secured</span>
                        <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Encrypted</span>
                        <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Tracked Delivery</span>
                      </div>

                      <button
                        type="submit"
                        disabled={placingOrder}
                        className="w-full py-4 rounded-2xl bg-accent text-accent-foreground font-medium text-base hover:opacity-90 transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {placingOrder ? "Placing Order..." : `Place Order — PKR ${total.toLocaleString()}`}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-card rounded-2xl p-6 shadow-soft space-y-4">
                <h3 className="font-display text-lg text-foreground">Order Summary</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <img src={item.product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <span className="text-xs font-bold text-foreground">PKR {(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>PKR {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `PKR ${shipping}`}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-primary">
                      <span>Discount</span>
                      <span>-PKR {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-foreground text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span>PKR {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Estimated delivery */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-xl p-3">
                  <Truck className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Estimated delivery: 3-5 business days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CheckoutPage;
