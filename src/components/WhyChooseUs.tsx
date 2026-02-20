import { motion } from "framer-motion";
import { Truck, CreditCard, RotateCcw, Shield } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Free delivery across Pakistan on orders above PKR 3,000. Express 1-2 day delivery available.",
  },
  {
    icon: CreditCard,
    title: "Cash on Delivery",
    description: "Pay when you receive your order. We also accept cards, bank transfer, and mobile wallets.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day hassle-free returns. No questions asked. Full refund guaranteed.",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "256-bit SSL encryption. Your payment information is always safe and secure.",
  },
];

const WhyChooseUs = () => (
  <section id="why" className="section-padding container-tight">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <span className="text-sm font-medium tracking-widest uppercase text-primary">
        Why ChefEase
      </span>
      <h2 className="font-display text-4xl sm:text-5xl text-foreground mt-3">
        Built on Trust
      </h2>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="group text-center p-8 rounded-3xl bg-card hover:bg-primary transition-all duration-500 shadow-soft hover:shadow-elevated"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 group-hover:bg-primary-foreground/20 flex items-center justify-center mb-5 transition-colors">
            <f.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
          </div>
          <h3 className="font-display text-xl text-foreground group-hover:text-primary-foreground transition-colors mb-2">
            {f.title}
          </h3>
          <p className="text-sm text-muted-foreground group-hover:text-primary-foreground/80 transition-colors">
            {f.description}
          </p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default WhyChooseUs;
