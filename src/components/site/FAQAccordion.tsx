"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/data/faqs";

export function FAQAccordion() {
  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#faf8f0]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#c8993e]/10 border border-[#c8993e]/20 rounded-full px-4 py-1.5 text-[#c8993e] text-sm font-medium mb-4">
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2744] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-[#2a3d64]/60">
              Got questions? We&apos;ve got answers.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-shadow px-6 data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="text-left text-[#1a2744] font-semibold hover:no-underline py-5 text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#2a3d64]/60 leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
