import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="section-padding">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container-tight"
      >
        <div className="bg-primary rounded-3xl p-10 sm:p-16 text-center shadow-elevated">
          <h2 className="font-display text-3xl sm:text-4xl text-primary-foreground mb-4">
            Join the ChefEase Family
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Get exclusive deals, new arrivals, and kitchen tips delivered to your inbox.
          </p>

          {submitted ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-primary-foreground font-medium text-lg"
            >
              ✓ Thank you for subscribing!
            </motion.p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-5 py-3.5 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus:border-primary-foreground/50 transition-colors"
                required
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-accent text-accent-foreground font-medium hover:opacity-90 transition-all group"
              >
                Subscribe
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default Newsletter;
