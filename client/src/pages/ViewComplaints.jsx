import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion'; // Import framer-motion for animations
import { useTheme } from '../context/Theme'; // Import ThemeContext
import Navbar from '../components/Navbar/Navbar'; // Import Navbar
import Footer from '../components/Footer/Footer'; // Import Footer
import {toast} from "sonner"
import axiosClient from '../api/axios_client';
function ViewComplaints() {
  const { theme } = useTheme(); // Get the current theme
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const response = await axiosClient.get("/complaint/");
        if (response.status == 200) {
          setComplaints(response.data.complaints);
        } else {
          toast.error("Error fetching complaints.");
        }
      } catch (error) {
        console.log("error fetching complaints");
        toast.error("Error fetching complaints");
      }
    }
    fetchComplaints();
    console.log(complaints);
    
  }, []);

  // Function to update the status of a complaint
  // Function to update the status of a complaint
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await axiosClient.get(`/complaint/${id}/${newStatus}`);

      if (response.status === 200) {
        toast.success("Status updated successfully");

        // Update the UI by modifying the complaints state
        setComplaints((prevComplaints) =>
          prevComplaints.map((complaint) =>
            complaint.id === id
              ? { ...complaint, status: newStatus }
              : complaint
          )
        );
      } else {
        toast.error("Error updating status.");
      }
    } catch (error) {
      console.log("Error updating status", error);
      toast.error("Error updating status");
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-background-dark text-foreground-dark"
          : "bg-background text-foreground"
      }`}
    >
      <Navbar /> {/* Add Navbar */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Complaints</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint,i) => {
            console.log(complaint.userId.name,i);
            const name = complaint.userId.name
            const email = complaint.userId.email
            return (
            <motion.div
              key={complaint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }} // Hover effect
              className={`rounded-lg shadow-lg p-6 hover:shadow-xl transition-all ${
                theme === "dark"
                  ? "bg-card-dark text-foreground-dark border border-gray-700 hover:border-blue-500"
                  : "bg-card text-foreground border border-gray-200 hover:border-blue-500"
              }`}
            >
              <h2 className="text-xl font-semibold mb-2">
                {name}
              </h2>
              <p className="text-muted-foreground mb-2">
                {email}
              </p>
              <p className="mb-2">
                <span className="font-medium">Issue Type:</span>{" "}
                {complaint.issueType}
              </p>
              <p className="mb-4">
                <span className="font-medium">Description:</span>{" "}
                {complaint.description}
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
                  onChange={(e) => updateStatus(complaint._id, e.target.value)}
                  className={`px-3 py-1 border rounded-md focus:outline-none focus:ring-2 ${
                    theme === "dark"
                      ? "bg-card-dark border-border-dark bg-black text-white"
                      : "bg-card border-border text-black"
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </motion.div>
          )})}
        </div>
      </div>
      <Footer /> {/* Add Footer */}
    </div>
  );
}

export default ViewComplaints;