import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, CreditCard, RotateCcw, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const policies = [
  {
    icon: Truck,
    title: "Shipping Policy",
    content: [
      "Free standard shipping on all orders above PKR 3,000.",
      "Standard delivery: 3-5 business days across Pakistan.",
      "Express delivery: 1-2 business days for PKR 300.",
      "Orders are processed within 24 hours on business days.",
      "You will receive SMS and email tracking updates.",
    ],
  },
  {
    icon: RotateCcw,
    title: "Return & Refund Policy",
    content: [
      "30-day hassle-free return policy on all products.",
      "Items must be unused and in original packaging.",
      "Contact our support team to initiate a return.",
      "Refunds are processed within 5-7 business days.",
      "Free return pickup available in major cities.",
    ],
  },
  {
    icon: Shield,
    title: "Privacy Policy",
    content: [
      "We collect only necessary information to process your orders.",
      "Your data is encrypted with 256-bit SSL security.",
      "We never share your personal information with third parties.",
      "You can request deletion of your account data at any time.",
      "We use cookies to improve your shopping experience.",
    ],
  },
  {
    icon: CreditCard,
    title: "Terms of Service",
    content: [
      "By using RapidKitch, you agree to these terms.",
      "Prices are in PKR and may change without notice.",
      "Product images are for illustration; minor variations may occur.",
      "We reserve the right to cancel orders due to stock issues.",
      "All products come with manufacturer warranty as stated.",
    ],
  },
];

const PoliciesPage = () => (
  <>
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container-tight px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-4">Policies</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Everything you need to know about shopping with RapidKitch.
          </p>
        </motion.div>

        <div className="space-y-6 max-w-3xl mx-auto">
          {policies.map((policy, i) => (
            <motion.div
              key={policy.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 sm:p-8 shadow-soft"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <policy.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-xl text-foreground">{policy.title}</h2>
              </div>
              <ul className="space-y-2">
                {policy.content.map((item, j) => (
                  <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default PoliciesPage;
