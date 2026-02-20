import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-kitchen.jpg";

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Parallax Background */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Premium kitchen setup"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 section-padding container-tight w-full">
        <div className="max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block text-sm font-medium tracking-widest uppercase text-primary mb-6"
          >
            Premium Kitchen Essentials
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.1] text-foreground mb-6"
          >
            Upgrade Your
            <br />
            <span className="text-primary">Kitchen</span> Experience
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-lg font-body"
          >
            Smart tools. Easy cooking. Modern lifestyle. Discover kitchen gadgets
            designed for the way you live.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#featured"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-medium text-base hover:opacity-90 transition-all shadow-soft group"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#bestsellers"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-border text-foreground font-medium text-base hover:bg-secondary transition-all group"
            >
              <Play className="w-4 h-4" />
              View Best Sellers
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-14 flex items-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["SA", "AH", "FK"].map((a, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs font-bold text-secondary-foreground"
                  >
                    {a}
                  </div>
                ))}
              </div>
              <span>10K+ Happy Customers</span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-accent">★</span>
              ))}
              <span className="ml-1">4.8/5 Rating</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
