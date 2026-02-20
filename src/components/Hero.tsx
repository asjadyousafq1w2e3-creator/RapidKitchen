import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-kitchen.jpg";

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[90vh] sm:min-h-screen flex items-center overflow-hidden">
      {/* Parallax Background */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Premium kitchen setup with modern gadgets"
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/20 sm:from-background/90 sm:via-background/50 sm:to-transparent" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 section-padding container-tight w-full">
        <div className="max-w-xl lg:max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-6"
          >
            <div className="w-8 h-px bg-primary" />
            <span className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-primary">
              Premium Kitchen Essentials
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] text-foreground mb-5 sm:mb-6"
          >
            Upgrade Your
            <br />
            <span className="text-primary italic">Kitchen</span> Experience
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-md leading-relaxed"
          >
            Smart tools. Easy cooking. Modern lifestyle. Discover kitchen gadgets
            designed for the way you live.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <a
              href="#featured"
              className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-primary text-primary-foreground font-medium text-sm sm:text-base hover:opacity-90 transition-all shadow-soft group"
            >
              Shop Collection
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#bestsellers"
              className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl border border-border text-foreground font-medium text-sm sm:text-base hover:bg-secondary transition-all"
            >
              Best Sellers
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-10 sm:mt-14 flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["SA", "AH", "FK"].map((a, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[10px] sm:text-xs font-bold text-secondary-foreground"
                  >
                    {a}
                  </div>
                ))}
              </div>
              <span>10K+ Happy Customers</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-accent text-xs">★</span>
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
