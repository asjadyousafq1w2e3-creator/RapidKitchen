import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactInfo = [
    { icon: MapPin, label: "Address", value: "Office 12, Gulberg III, Lahore, Pakistan" },
    { icon: Phone, label: "Phone", value: "+92 321 1234567" },
    { icon: Mail, label: "Email", value: "hello@kitchub.store" },
    { icon: Clock, label: "Hours", value: "Mon - Sat: 9AM - 8PM PKT" },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us | Kitchub Store</title>
        <meta name="description" content="Get in touch with the Kitchub Store team. Have questions about our products or your order? We are here to help." />
        <link rel="canonical" href="https://kitchub.store/contact" />
      </Helmet>
      <Navbar />
      <main className="pt-24">
        {/* Header */}
        <section className="section-padding container-tight text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-px bg-primary" />
              <span className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-primary">Get in Touch</span>
              <div className="w-8 h-px bg-primary" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Have a question about our products, your order, or just want to say hello?
              We're here to help. Reach out to the Kitchub Store team.
            </p>
          </motion.div>
        </section>

        <section className="container-tight px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {contactInfo.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-card shadow-soft">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              {submitted ? (
                <div className="text-center py-20 bg-card rounded-3xl shadow-soft">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Send className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 bg-card rounded-3xl p-6 sm:p-8 shadow-soft">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground text-sm outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all shadow-soft"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ContactPage;
