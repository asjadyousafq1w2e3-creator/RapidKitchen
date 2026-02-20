import { motion } from "framer-motion";
import { testimonials } from "@/data/products";

const Testimonials = () => (
  <section className="section-padding bg-secondary/50">
    <div className="container-tight">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <span className="text-sm font-medium tracking-widest uppercase text-primary">
          Testimonials
        </span>
        <h2 className="font-display text-4xl sm:text-5xl text-foreground mt-3">
          Loved by Thousands
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-3xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, j) => (
                <span key={j} className={j < t.rating ? "text-accent" : "text-muted"}>
                  ★
                </span>
              ))}
            </div>
            <p className="text-foreground text-sm leading-relaxed mb-6">"{t.content}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {t.avatar}
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
