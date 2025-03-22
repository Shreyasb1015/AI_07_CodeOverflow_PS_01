import { motion } from "framer-motion";
import { Star } from "lucide-react";

const Card = ({ review, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      whileHover={{ scale: 1.05 }}
      className="p-8 rounded-xl border hover:shadow-lg transition-all"
    >
      <div className="flex gap-2 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i}
            size={20}
            className={i < review.rating ? "text-primary fill-primary" : "text-muted-foreground"}
          />
        ))}
      </div>
      <p className="text-lg mb-4">"{review.feedback}"</p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-lg">👤</span>
        </div>
        <div>
          <h3 className="font-semibold">{review.name}</h3>
          <p className="text-muted-foreground text-sm">{review.role}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Card;