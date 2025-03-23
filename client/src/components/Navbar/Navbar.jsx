import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import { useTheme } from "../../context/Theme"; // Adjust the path as needed
import { Sun, Moon } from "lucide-react";


const user = JSON.parse(localStorage.getItem("currentUser"))

const navItems = [
  { name: "Home", path: "/"},
  { name: "Profile", path: "/profile" },
  { name: "ChatWithAI", path: "/chat" },
];

if (user?.role == "Administrator"){
  navItems.push({ name: "Knowledge Base", path: "knowledge-base" });
}
if (user?.role == "SupportTeam"){
  navItems.push({ name: "View Complaints", path: "view-complaints" });
}

const Navbar = () => {
  console.log(user);
  
 
  console.log(navItems);
  
  const { theme, toggleTheme } = useTheme();

  const location = useLocation(); // Get the current route location


  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 50 }}
      className="w-full bg-background/80 backdrop-blur-md border-b sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-800 bg-clip-text text-transparent"
        >
          EchoMind{" "}
        </motion.div>

        {/* Navigation Links */}
        <div className="flex gap-6 items-center">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path; // Check if the current route matches the item path
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                <Link
                  to={item.path}
                  className={`relative group px-4 py-2 rounded-full transition-colors ${
                    isActive
                      ? "text-black dark:text-primary" // Orange background for active link
                      : "hover:text-orange-500" // Orange text on hover for inactive links
                  }`}
                >
                  {item.name}
                  {/* Underline on hover */}
                  {!isActive && (
                    <motion.span
                      className="absolute bottom-0 left-0 w-0 h-[2px] bg-orange-500 transition-all group-hover:w-full"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}

          {/* Theme Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Sun className="w-5 h-5 text-primary" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;