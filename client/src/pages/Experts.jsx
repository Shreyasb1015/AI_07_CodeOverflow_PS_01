import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const Experts = () => {
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const experts = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      profileImage: "./src/assets/user-iconmicon.jpg",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      profileImage: "./src/assets/user-iconmicon.jpg",
    },
    {
      id: 3,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      profileImage: "./src/assets/user-iconmicon.jpg",
    },
    {
      id: 4,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      profileImage: "./src/assets/user-iconmicon.jpg",
    },
    {
      id: 5,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      profileImage: "./src/assets/user-iconmicon.jpg",
    },
    {
      id: 6,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      profileImage: "./src/assets/user-iconmicon.jpg",
    },
  ];

  const handleRequest = (expertId) => {
    console.log(`Request sent to expert with ID: ${expertId}`);
    navigate("/meet/request"); // Navigate to /request after clicking the button
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "light" ? "bg-light-bg-color text-light-text-color" : "bg-dark-bg-color text-dark-text-color"
      }`}
    >
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Meet Our Experts</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert) => (
            <motion.div
              key={expert.id}
              className={`p-6 rounded-lg shadow-lg ${
                theme === "light" ? "bg-white" : "bg-gray-800"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center">
                <img
                  src={expert.profileImage}
                  alt={expert.name}
                  className="w-24 h-24 rounded-full mb-4"
                />
                <h2 className="text-xl font-semibold">{expert.name}</h2>
                <p className="text-sm text-gray-500 mb-4">{expert.email}</p>
                <button
                  onClick={() => handleRequest(expert.id)}
                  className={`px-4 py-2 rounded ${
                    theme === "light"
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Request
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer theme={theme} />
    </div>
  );
};

export default Experts;