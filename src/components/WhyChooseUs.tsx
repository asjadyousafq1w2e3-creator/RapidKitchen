import { motion } from "framer-motion";
import { Truck, CreditCard, RotateCcw, Shield } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Fast Shipping",
    description: "Free delivery on orders above PKR 3,000. Express 1-2 day option available.",
  },
  {
    icon: CreditCard,
    title: "Cash on Delivery",
    description: "Pay when you receive. Cards, bank transfer & mobile wallets accepted.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day hassle-free returns. No questions asked, full refund.",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "256-bit SSL encryption. Your data is always safe.",
  },
];

const WhyChooseUs = () => (
  <section id="why" className="section-padding container-tight">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12 sm:mb-16"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="w-8 h-px bg-primary" />
        <span className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-primary">
          Why ChefEase
        </span>
        <div className="w-8 h-px bg-primary" />
      </div>
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground">
        Built on Trust
      </h2>
    </motion.div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="group text-center p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-card hover:bg-primary transition-all duration-500 shadow-soft hover:shadow-elevated"
        >
          <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto rounded-xl sm:rounded-2xl bg-primary/10 group-hover:bg-primary-foreground/20 flex items-center justify-center mb-3 sm:mb-5 transition-colors">
            <f.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary group-hover:text-primary-foreground transition-colors" />
          </div>
          <h3 className="font-display text-base sm:text-xl text-foreground group-hover:text-primary-foreground transition-colors mb-1 sm:mb-2">
            {f.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground group-hover:text-primary-foreground/80 transition-colors hidden sm:block">
            {f.description}
          </p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default WhyChooseUs;
