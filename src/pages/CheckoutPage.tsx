import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X, Truck, Shield, ArrowRight, ChevronLeft, Tag, MapPin, Phone, Mail, User, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const FREE_SHIPPING = 3500;

interface ShippingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
}

const INITIAL_SHIPPING: ShippingForm = {
  firstName: "", lastName: "", email: "", phone: "",
  address: "", city: "", state: "", zip: "", notes: "",
};

const CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
  "Hyderabad", "Bahawalpur", "Sargodha", "Abbottabad", "Other",
];

const CheckoutPage = () => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"cart" | "shipping" | "review">("cart");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLabel, setCouponLabel] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingForm>(INITIAL_SHIPPING);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderId, setOrderId] = useState("");

  const shipping = totalPrice >= FREE_SHIPPING ? 0 : 150;
  const discount = couponApplied ? couponDiscount : 0;
  const total = totalPrice + shipping - discount;

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-coupon", {
        body: { code: coupon, order_total: totalPrice },
      });
      if (error || !data?.valid) {
        toast.error(data?.error || "Invalid coupon code");
        setCouponApplied(false);
        setCouponDiscount(0);
      } else {
        setCouponApplied(true);
        setCouponDiscount(data.discount);
        setCouponLabel(
          data.discount_type === "percentage"
            ? `${data.discount_value}% discount applied!`
            : `PKR ${data.discount_value} discount applied!`
        );
        toast.success("Coupon applied!");
      }
    } catch {
      toast.error("Failed to validate coupon");
    }
    setCouponLoading(false);
  };

  const validateShipping = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingForm, string>> = {};
    if (!shippingData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!shippingData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!shippingData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) newErrors.email = "Invalid email";
    if (!shippingData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[\d\s+()-]{10,15}$/.test(shippingData.phone.replace(/\s/g, ""))) newErrors.phone = "Invalid phone number";
    if (!shippingData.address.trim()) newErrors.address = "Address is required";
    if (!shippingData.city.trim()) newErrors.city = "City is required";
    if (!shippingData.state.trim()) newErrors.state = "Province is required";
    if (!shippingData.zip.trim()) newErrors.zip = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToReview = () => {
    if (validateShipping()) {
      setStep("review");
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-order", {
        body: {
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            color: item.color || null,
          })),
          shipping: shippingData,
          couponCode: couponApplied ? coupon : null,
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || "Failed to place order");
      }

      setOrderId(data.orderId);
      setOrderPlaced(true);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (err: any) {
      console.error("Order failed:", err);
      toast.error(err?.message || "Failed to place order. Please try again.");
    }
    setPlacingOrder(false);
  };

  const updateField = (key: keyof ShippingForm, value: string) => {
    setShippingData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // ─── Order Confirmation ───
  if (orderPlaced) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container-tight px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center py-16"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-display text-3xl text-foreground mb-3">Order Confirmed!</h1>
              <p className="text-muted-foreground mb-1">Thank you for your purchase.</p>
              <p className="text-sm text-muted-foreground mb-6">
                Order <span className="font-mono font-bold text-foreground">#{orderId.slice(0, 8).toUpperCase()}</span>
              </p>

              <div className="bg-card rounded-2xl p-5 shadow-soft text-left mb-6 space-y-3">
                <h3 className="font-medium text-sm text-foreground">Order Details</h3>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p><span className="font-medium text-foreground">Name:</span> {shippingData.firstName} {shippingData.lastName}</p>
                  <p><span className="font-medium text-foreground">Phone:</span> {shippingData.phone}</p>
                  <p><span className="font-medium text-foreground">Address:</span> {shippingData.address}, {shippingData.city}, {shippingData.state} {shippingData.zip}</p>
                  <p><span className="font-medium text-foreground">Payment:</span> Cash on Delivery (COD)</p>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-sm">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="font-bold text-foreground">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-xl p-3 mb-6 text-xs text-muted-foreground flex items-start gap-2">
                <Truck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Your order will be delivered in 3-5 business days. Our team will contact you at <strong>{shippingData.phone}</strong> for delivery confirmation.</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all"
                >
                  Continue Shopping
                </Link>
                {user && (
                  <Link
                    to="/account"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-secondary text-secondary-foreground font-medium text-sm hover:bg-muted transition-all"
                  >
                    View My Orders
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ─── Main Checkout ───
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-tight px-4 sm:px-6 lg:px-8">
          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
            {["Cart", "Shipping", "Review & Pay"].map((s, i) => {
              const stepKey = ["cart", "shipping", "review"][i];
              const currentIndex = ["cart", "shipping", "review"].indexOf(step);
              const isActive = i <= currentIndex;
              return (
                <div key={s} className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => i < currentIndex && setStep(stepKey as any)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {i < currentIndex ? "✓" : i + 1}
                    </span>
                    <span className="hidden sm:inline">{s}</span>
                  </button>
                  {i < 2 && <div className={`w-8 sm:w-16 h-px transition-colors ${isActive ? "bg-primary" : "bg-border"}`} />}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* ─── STEP 1: CART ─── */}
                {step === "cart" && (
                  <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <h2 className="font-display text-2xl text-foreground mb-6">Shopping Cart ({items.length})</h2>
                    {items.length === 0 ? (
                      <div className="text-center py-16 bg-card rounded-2xl shadow-soft">
                        <p className="text-muted-foreground mb-4">Your cart is empty</p>
                        <Link to="/shop" className="text-primary font-medium text-sm hover:underline">Browse Products</Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div key={item.product.id + (item.color || "")} className="flex gap-4 p-4 bg-card rounded-2xl shadow-soft">
                            <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover" />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="font-medium text-sm text-foreground">{item.product.name}</h3>
                                  <p className="text-xs text-muted-foreground mt-0.5">{item.color || item.product.category}</p>
                                </div>
                                <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2 bg-secondary rounded-xl p-0.5">
                                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"><Minus className="w-3 h-3" /></button>
                                  <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"><Plus className="w-3 h-3" /></button>
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
                            onClick={handleApplyCoupon}
                            disabled={couponLoading}
                            className="px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            {couponLoading ? "..." : "Apply"}
                          </button>
                        </div>
                        {couponApplied && <p className="text-sm text-primary font-medium">✓ {couponLabel}</p>}

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

                {/* ─── STEP 2: SHIPPING ─── */}
                {step === "shipping" && (
                  <motion.div key="shipping" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <button onClick={() => setStep("cart")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                      <ChevronLeft className="w-4 h-4" /> Back to Cart
                    </button>
                    <h2 className="font-display text-2xl text-foreground mb-6">Delivery Information</h2>

                    <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-soft space-y-5">
                      {/* Contact info */}
                      <div>
                        <h3 className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                          <User className="w-4 h-4 text-primary" /> Contact Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FieldInput label="First Name *" value={shippingData.firstName} error={errors.firstName} onChange={(v) => updateField("firstName", v)} placeholder="Muhammad" />
                          <FieldInput label="Last Name *" value={shippingData.lastName} error={errors.lastName} onChange={(v) => updateField("lastName", v)} placeholder="Ali" />
                          <FieldInput label="Email *" value={shippingData.email} error={errors.email} onChange={(v) => updateField("email", v)} placeholder="you@example.com" type="email" icon={<Mail className="w-4 h-4" />} />
                          <FieldInput label="Phone *" value={shippingData.phone} error={errors.phone} onChange={(v) => updateField("phone", v)} placeholder="03XX-XXXXXXX" type="tel" icon={<Phone className="w-4 h-4" />} />
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <h3 className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-primary" /> Delivery Address
                        </h3>
                        <div className="space-y-4">
                          <FieldInput label="Street Address *" value={shippingData.address} error={errors.address} onChange={(v) => updateField("address", v)} placeholder="House #, Street, Area" />
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">City *</label>
                              <select
                                value={shippingData.city}
                                onChange={(e) => updateField("city", e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl bg-background border text-sm outline-none transition-colors ${errors.city ? "border-destructive" : "border-border focus:border-primary"} text-foreground`}
                              >
                                <option value="">Select city</option>
                                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                              </select>
                              {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                            </div>
                            <FieldInput label="Province *" value={shippingData.state} error={errors.state} onChange={(v) => updateField("state", v)} placeholder="Punjab" />
                            <FieldInput label="ZIP Code *" value={shippingData.zip} error={errors.zip} onChange={(v) => updateField("zip", v)} placeholder="54000" />
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Order Notes (optional)</label>
                        <textarea
                          value={shippingData.notes}
                          onChange={(e) => updateField("notes", e.target.value)}
                          placeholder="Any special instructions for delivery..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors resize-none"
                        />
                      </div>

                      <button
                        onClick={handleContinueToReview}
                        className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all shadow-soft flex items-center justify-center gap-2 mt-2"
                      >
                        Review Order <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ─── STEP 3: REVIEW & PAY ─── */}
                {step === "review" && (
                  <motion.div key="review" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <button onClick={() => setStep("shipping")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                      <ChevronLeft className="w-4 h-4" /> Back to Shipping
                    </button>
                    <h2 className="font-display text-2xl text-foreground mb-6">Review & Confirm</h2>

                    <div className="space-y-4">
                      {/* Delivery summary */}
                      <div className="bg-card rounded-2xl p-5 shadow-soft">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" /> Delivery Address
                          </h3>
                          <button onClick={() => setStep("shipping")} className="text-xs text-primary hover:underline">Edit</button>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-0.5">
                          <p className="font-medium text-foreground">{shippingData.firstName} {shippingData.lastName}</p>
                          <p>{shippingData.address}</p>
                          <p>{shippingData.city}, {shippingData.state} {shippingData.zip}</p>
                          <p>{shippingData.phone}</p>
                        </div>
                      </div>

                      {/* Payment method */}
                      <div className="bg-card rounded-2xl p-5 shadow-soft">
                        <h3 className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                          💵 Payment Method
                        </h3>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border-2 border-primary">
                          <span className="text-2xl">💵</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">Cash on Delivery</p>
                            <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                          </div>
                          <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          </div>
                        </div>
                      </div>

                      {/* Items summary */}
                      <div className="bg-card rounded-2xl p-5 shadow-soft">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-foreground">Items ({items.length})</h3>
                          <button onClick={() => setStep("cart")} className="text-xs text-primary hover:underline">Edit</button>
                        </div>
                        <div className="space-y-3">
                          {items.map((item) => (
                            <div key={item.product.id} className="flex items-center gap-3">
                              <img src={item.product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{item.product.name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}{item.color ? ` • ${item.color}` : ""}</p>
                              </div>
                              <span className="text-xs font-bold text-foreground">PKR {(item.product.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Trust badges */}
                      <div className="flex flex-wrap items-center justify-center gap-4 py-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Secure Checkout</span>
                        <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Tracked Delivery</span>
                      </div>

                      <button
                        onClick={handlePlaceOrder}
                        disabled={placingOrder}
                        className="w-full py-4 rounded-2xl bg-accent text-accent-foreground font-medium text-base hover:opacity-90 transition-all shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {placingOrder ? "Placing Order..." : `Confirm Order — PKR ${total.toLocaleString()}`}
                      </button>
                      <p className="text-center text-xs text-muted-foreground">
                        By placing this order, you agree to our terms. You'll pay <strong>PKR {total.toLocaleString()}</strong> upon delivery.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── ORDER SUMMARY SIDEBAR ─── */}
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
                    <span>{shipping === 0 ? <span className="text-primary font-medium">Free</span> : `PKR ${shipping}`}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-primary">
                      <span>Discount (10%)</span>
                      <span>-PKR {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-foreground text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span>PKR {total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-xl p-3">
                  <Truck className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>
                    {totalPrice >= FREE_SHIPPING
                      ? "🎉 You qualify for free shipping!"
                      : `Add PKR ${(FREE_SHIPPING - totalPrice).toLocaleString()} more for free shipping`}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground bg-secondary rounded-xl p-3">
                  💵 <strong>Cash on Delivery</strong> — Pay when you receive your order
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

// ─── Reusable Field Component ───
const FieldInput = ({
  label, value, error, onChange, placeholder, type = "text", icon,
}: {
  label: string; value: string; error?: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; icon?: React.ReactNode;
}) => (
  <div>
    <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">{label}</label>
    <div className="relative">
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${icon ? "pl-10" : "px-4"} pr-4 py-3 rounded-xl bg-background border text-sm outline-none transition-colors ${error ? "border-destructive" : "border-border focus:border-primary"
          } text-foreground placeholder:text-muted-foreground`}
      />
    </div>
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

export default CheckoutPage;
