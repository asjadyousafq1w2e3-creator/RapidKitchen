import { motion } from "framer-motion";
import { faqs } from "@/data/products";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => (
  <section id="faq" className="section-padding container-tight">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12"
    >
      <span className="text-sm font-medium tracking-widest uppercase text-primary">
        Support
      </span>
      <h2 className="font-display text-4xl sm:text-5xl text-foreground mt-3">
        Frequently Asked Questions
      </h2>
    </motion.div>

    <div className="max-w-2xl mx-auto">
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <AccordionItem
              value={`faq-${i}`}
              className="bg-card rounded-2xl px-6 border-none shadow-soft"
            >
              <AccordionTrigger className="text-left font-display text-base hover:no-underline text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
