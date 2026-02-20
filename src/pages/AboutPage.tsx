import { motion } from "framer-motion";
import { Award, Users, Leaf, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const values = [
  { icon: Award, title: "Quality First", description: "Every product undergoes rigorous testing. We partner with top manufacturers to bring you tools that last." },
  { icon: Users, title: "Customer Obsessed", description: "10,000+ happy customers trust us. Our support team is available 6 days a week to help you." },
  { icon: Leaf, title: "Sustainable", description: "We use eco-friendly packaging and partner with brands committed to reducing environmental impact." },
  { icon: Heart, title: "Community Driven", description: "We listen to our community. Many products are developed based on customer feedback and suggestions." },
];

const AboutPage = () => (
  <>
    <Navbar />
    <main className="pt-24">
      {/* Header */}
      <section className="section-padding container-tight text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-px bg-primary" />
            <span className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-primary">Our Story</span>
            <div className="w-8 h-px bg-primary" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-6">About ChefEase</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Born from a simple idea — that cooking should be a joy, not a chore. We curate the smartest kitchen gadgets 
            from around the world and bring them to Pakistani homes at honest prices.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="container-tight px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[
            { stat: "10K+", label: "Customers" },
            { stat: "50+", label: "Products" },
            { stat: "4.8", label: "Avg Rating" },
            { stat: "98%", label: "Satisfaction" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 sm:p-8 bg-card rounded-2xl shadow-soft"
            >
              <p className="font-display text-3xl sm:text-4xl text-primary">{s.stat}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-secondary/50">
        <div className="container-tight">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-6">
                From Kitchen Lovers,<br />For Kitchen Lovers
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
                <p>
                  ChefEase started in 2023 when our founder, tired of low-quality kitchen tools flooding the market, 
                  decided to create a brand that stands for quality, design, and functionality.
                </p>
                <p>
                  Today, we're Pakistan's fastest-growing kitchen gadgets brand, serving customers across all major cities. 
                  Every product in our catalog is personally tested and approved by our team of home chefs and food enthusiasts.
                </p>
                <p>
                  We believe great tools inspire great cooking. That's why we go the extra mile to find products that 
                  are not just functional, but beautifully designed to complement your modern kitchen.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=700&fit=crop"
                alt="Kitchen team"
                className="rounded-3xl shadow-elevated w-full object-cover aspect-[4/5]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding container-tight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl text-foreground">Our Values</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card shadow-soft text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <v.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
    <Footer />
  </>
);

export default AboutPage;
