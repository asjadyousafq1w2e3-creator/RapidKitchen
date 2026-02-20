import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Truck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

const FREE_SHIPPING_THRESHOLD = 3000;

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();
  const shippingProgress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const freeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm sm:max-w-md bg-background z-50 flex flex-col shadow-elevated"
          >
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                <h2 className="font-display text-lg sm:text-xl text-foreground">Cart ({totalItems})</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="px-4 sm:px-6 py-3 border-b border-border">
              <div className="flex items-center gap-2 text-xs sm:text-sm mb-2">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                {freeShipping ? (
                  <span className="text-primary font-medium">Free shipping unlocked!</span>
                ) : (
                  <span className="text-muted-foreground">
                    PKR {(FREE_SHIPPING_THRESHOLD - totalPrice).toLocaleString()} away from free shipping
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${shippingProgress}%` }}
                  className="h-full bg-primary rounded-full"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm mb-4">Your cart is empty</p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/shop");
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="flex gap-3 sm:gap-4"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover bg-secondary"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm text-foreground truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                          PKR {item.product.price.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 sm:gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs sm:text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <span className="text-xs sm:text-sm font-bold text-foreground">
                          PKR {(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-border space-y-3 sm:space-y-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-foreground">
                    PKR {totalPrice.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all shadow-soft"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/shop");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
