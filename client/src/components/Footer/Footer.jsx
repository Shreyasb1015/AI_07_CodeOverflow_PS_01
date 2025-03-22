import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background/90 border-t mt-24"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-bold">EchoMind</h3>
            <p className="text-muted-foreground">
              Empowering the future through innovative solutions
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <h4 className="font-semibold">Quick Links</h4>
            {['About Us', 'Careers', 'Blog', 'Documentation'].map((link, index) => (
              <motion.a
                key={link}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                {link}
              </motion.a>
            ))}
          </motion.div>

          {/* Social Media */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h4 className="font-semibold">Connect With Us</h4>
            {['Twitter', 'LinkedIn', 'GitHub', 'Discord'].map((social, index) => (
              <motion.a
                key={social}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                {social}
              </motion.a>
            ))}
          </motion.div>

          {/* Newsletter */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="font-semibold">Stay Updated</h4>
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full p-2 rounded border bg-background focus:outline-primary" 
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white dark:text-slate-900 px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              Subscribe
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="border-t mt-8 pt-6 text-center text-muted-foreground"
        >
          © 2023 Welcome. All rights reserved.
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;