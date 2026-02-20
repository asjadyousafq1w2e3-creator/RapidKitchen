import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";

const FREE_SHIPPING_THRESHOLD = 3000;

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const shippingProgress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const freeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 flex flex-col shadow-elevated"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-foreground" />
                <h2 className="font-display text-xl text-foreground">Cart ({totalItems})</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Bar */}
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2 text-sm mb-2">
                <Truck className="w-4 h-4 text-primary" />
                {freeShipping ? (
                  <span className="text-primary font-medium">You've unlocked free shipping!</span>
                ) : (
                  <span className="text-muted-foreground">
                    PKR {(FREE_SHIPPING_THRESHOLD - totalPrice).toLocaleString()} away from free shipping
                  </span>
                )}
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${shippingProgress}%` }}
                  className="h-full bg-primary rounded-full"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
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
                      className="flex gap-4"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-2xl object-cover bg-secondary"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          PKR {item.product.price.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
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
                          <X className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-foreground">
                          PKR {(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-foreground">
                    PKR {totalPrice.toLocaleString()}
                  </span>
                </div>
                <button className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-medium text-base hover:opacity-90 transition-all shadow-soft">
                  Proceed to Checkout
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
