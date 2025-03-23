import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion'; // Import framer-motion for animations
import { useTheme } from '../context/Theme'; // Import ThemeContext
import Navbar from '../components/Navbar/Navbar'; // Import Navbar
import Footer from '../components/Footer/Footer'; // Import Footer

function ViewComplaints() {
  const { theme } = useTheme(); // Get the current theme
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      userName: "John Doe",
      userEmail: "john.doe@example.com",
      issueType: "Technical Issue",
      description: "Unable to access my account.",
      status: "Pending",
    },
    {
      id: 2,
      userName: "Jane Smith",
      userEmail: "jane.smith@example.com",
      issueType: "Billing Issue",
      description: "Charged twice for the same service.",
      status: "In Progress",
    },
    {
      id: 3,
      userName: "Alice Johnson",
      userEmail: "alice.johnson@example.com",
      issueType: "Feature Request",
      description: "Please add dark mode to the app.",
      status: "Resolved",
    },
    {
      id: 4,
      userName: "Bob Brown",
      userEmail: "bob.brown@example.com",
      issueType: "Bug Report",
      description: "App crashes when clicking on the settings icon.",
      status: "Rejected",
    },
  ]);

  // Function to update the status of a complaint
  const updateStatus = (id, newStatus) => {
    setComplaints((prevComplaints) =>
      prevComplaints.map((complaint) =>
        complaint.id === id ? { ...complaint, status: newStatus } : complaint
      )
    );
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background-dark text-foreground-dark' : 'bg-background text-foreground'}`}>
      <Navbar /> {/* Add Navbar */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Complaints</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint) => (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }} // Hover effect
              className={`rounded-lg shadow-lg p-6 hover:shadow-xl transition-all ${
                theme === 'dark'
                  ? 'bg-card-dark text-foreground-dark border border-gray-700 hover:border-blue-500'
                  : 'bg-card text-foreground border border-gray-200 hover:border-blue-500'
              }`}
            >
              <h2 className="text-xl font-semibold mb-2">{complaint.userName}</h2>
              <p className="text-muted-foreground mb-2">{complaint.userEmail}</p>
              <p className="mb-2">
                <span className="font-medium">Issue Type:</span> {complaint.issueType}
              </p>
              <p className="mb-4">
                <span className="font-medium">Description:</span> {complaint.description}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    complaint.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : complaint.status === "In Progress"
                      ? "bg-blue-100 text-blue-800"
                      : complaint.status === "Resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {complaint.status}
                </span>
                <select
                  value={complaint.status}
                  onChange={(e) => updateStatus(complaint.id, e.target.value)}
                  className={`px-3 py-1 border rounded-md focus:outline-none focus:ring-2 ${
                    theme === 'dark'
                      ? 'bg-card-dark border-border-dark bg-black text-white'
                      : 'bg-card border-border text-black'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer /> {/* Add Footer */}
    </div>
  );
}

export default ViewComplaints;