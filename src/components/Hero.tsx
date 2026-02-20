import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage1 from "@/assets/hero-kitchen.jpg";
import heroImage2 from "@/assets/hero-slide-2.jpg";
import heroImage3 from "@/assets/hero-slide-3.jpg";

const slides = [
  {
    image: heroImage1,
    tag: "New Season Collection",
    headingLine1: "Cook Like a",
    headingAccent: "Pro",
    headingLine2: "at Home",
    description: "Premium kitchen gadgets engineered for perfection. Transform every meal into a masterpiece.",
    cta: "Explore Collection",
    ctaLink: "#featured",
    secondary: "View Best Sellers",
    secondaryLink: "#bestsellers",
  },
  {
    image: heroImage2,
    tag: "Crafted for Excellence",
    headingLine1: "Where Design",
    headingAccent: "Meets",
    headingLine2: "Function",
    description: "Handpicked tools that blend stunning aesthetics with unmatched performance. Elevate your space.",
    cta: "Shop Now",
    ctaLink: "/shop",
    secondary: "Our Story",
    secondaryLink: "/about",
  },
  {
    image: heroImage3,
    tag: "Chef's Choice",
    headingLine1: "Precision in",
    headingAccent: "Every",
    headingLine2: "Detail",
    description: "From blade to handle, every tool is crafted for those who demand nothing less than extraordinary.",
    cta: "Discover Tools",
    ctaLink: "/shop",
    secondary: "Free Shipping",
    secondaryLink: "/policies",
  },
];

const SLIDE_DURATION = 6000;

const textVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? 60 : -60,
    filter: "blur(8px)",
  }),
  center: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? -40 : 40,
    filter: "blur(4px)",
  }),
};

const imageVariants = {
  enter: { opacity: 0, scale: 1.15 },
  center: { opacity: 1, scale: 1.05, transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: { opacity: 0, scale: 1, transition: { duration: 0.6 } },
};

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [[current, direction], setCurrent] = useState([0, 0]);
  const [isPaused, setIsPaused] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const paginate = useCallback((dir: number) => {
    setCurrent(([prev]) => [(prev + dir + slides.length) % slides.length, dir]);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => paginate(1), SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isPaused, paginate]);

  const slide = slides[current];

  return (
    <section
      ref={ref}
      className="relative min-h-[90vh] sm:min-h-screen flex items-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with Crossfade + Ken Burns */}
      <motion.div style={{ y: parallaxY }} className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.img
            key={current}
            src={slide.image}
            alt="Kitchen lifestyle"
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full object-cover"
            loading={current === 0 ? "eager" : "lazy"}
            fetchPriority={current === 0 ? "high" : "auto"}
          />
        </AnimatePresence>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/10 sm:from-background/90 sm:via-background/55 sm:to-transparent z-10" />
        {/* Bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent z-10" />
      </motion.div>

      {/* Content */}
      <motion.div style={{ opacity: contentOpacity }} className="relative z-20 section-padding container-tight w-full">
        <div className="max-w-xl lg:max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              className="will-change-transform"
            >
              {/* Tag */}
              <motion.div
                variants={textVariants}
                custom={direction}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="flex items-center gap-3 mb-5 sm:mb-6"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 32 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-px bg-primary"
                />
                <span className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-primary">
                  {slide.tag}
                </span>
              </motion.div>

              {/* Heading with staggered word reveals */}
              <motion.h1
                className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05] text-foreground mb-5 sm:mb-6"
              >
                <motion.span
                  variants={textVariants}
                  custom={direction}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="block overflow-hidden"
                >
                  <span className="inline-block">{slide.headingLine1}</span>
                </motion.span>
                <motion.span
                  variants={textVariants}
                  custom={direction}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="block overflow-hidden"
                >
                  <span className="text-primary italic inline-block">{slide.headingAccent}</span>{" "}
                  <span className="inline-block">{slide.headingLine2}</span>
                </motion.span>
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={textVariants}
                custom={direction}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-md leading-relaxed"
              >
                {slide.description}
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={textVariants}
                custom={direction}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <a
                  href={slide.ctaLink}
                  className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-primary text-primary-foreground font-medium text-sm sm:text-base hover:opacity-90 transition-all shadow-soft group"
                >
                  {slide.cta}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href={slide.secondaryLink}
                  className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl border border-border text-foreground font-medium text-sm sm:text-base hover:bg-secondary transition-all"
                >
                  {slide.secondary}
                </a>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Trust Indicators - static, no slide animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
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

      {/* Navigation Arrows */}
      <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col gap-3">
        <button
          onClick={() => paginate(-1)}
          className="w-11 h-11 rounded-full glass-card flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={() => paginate(1)}
          className="w-11 h-11 rounded-full glass-card flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 group"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Slide Indicators with progress bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent([i, i > current ? 1 : -1])}
            className="relative h-1.5 rounded-full overflow-hidden transition-all duration-500"
            style={{ width: i === current ? 48 : 16 }}
            aria-label={`Go to slide ${i + 1}`}
          >
            <div className="absolute inset-0 bg-foreground/20 rounded-full" />
            {i === current && (
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                key={`progress-${current}`}
                className="absolute inset-y-0 left-0 bg-primary rounded-full"
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
};

export default Hero;
