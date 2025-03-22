import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const Accordion = ({ children }) => {
  return <div className="space-y-4">{children}</div>;
};

export const AccordionItem = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left flex justify-between items-center hover:bg-accent/10 transition-colors"
      >
        <span className="font-semibold">{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>
      
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isOpen ? "auto" : 0 }}
        className="overflow-hidden"
      >
        <div className="p-4 pt-0 text-muted-foreground">
          {content}
        </div>
      </motion.div>
    </motion.div>
  );
};