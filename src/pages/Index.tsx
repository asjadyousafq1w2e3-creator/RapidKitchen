import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { lazy, Suspense } from "react";

// Lazy load below-the-fold sections - only loaded when user scrolls near them
const FeaturedProducts = lazy(() => import("@/components/FeaturedProducts"));
const BestSellers = lazy(() => import("@/components/BestSellers"));
const WhyChooseUs = lazy(() => import("@/components/WhyChooseUs"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const Newsletter = lazy(() => import("@/components/Newsletter"));
const Footer = lazy(() => import("@/components/Footer"));

const SectionLoader = () => (
  <div className="py-16 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => (
  <>
    <Navbar />
    <main>
      <Hero />
      <Suspense fallback={<SectionLoader />}>
        <FeaturedProducts />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <BestSellers />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <WhyChooseUs />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <FAQSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <Newsletter />
      </Suspense>
    </main>
    <Suspense fallback={null}>
      <Footer />
    </Suspense>
  </>
);

export default Index;
