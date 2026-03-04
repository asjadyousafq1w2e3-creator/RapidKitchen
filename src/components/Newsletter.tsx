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
        <div className="bg-primary rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center shadow-elevated relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-foreground/5" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-primary-foreground/5" />

          <div className="relative z-10">
            <span className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-primary-foreground/80">Kitchub Store Insider</span>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-primary-foreground mb-3 sm:mb-4">
              Join the Kitchub Store Family
            </h2>
            <p className="text-primary-foreground/70 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
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
                  className="flex-1 px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 outline-none focus:border-primary-foreground/50 transition-colors text-sm"
                  required
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-accent text-accent-foreground font-medium hover:opacity-90 transition-all group text-sm"
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Newsletter;
