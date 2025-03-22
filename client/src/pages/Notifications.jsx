import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const Notifications = () => {
  const navigate = useNavigate();

  // Dummy notifications data
  const notifications = [
    {
      id: 1,
      userName: "Alice",
      userEmail: "alice@example.com",
    },
    {
      id: 2,
      userName: "Bob",
      userEmail: "bob@example.com",
    },
  ];

  const handleAccept = (notificationId) => {
    navigate(`/meet/accept/${notificationId}`); // Navigate to accept form
  };

  const handleReject = (notificationId) => {
    console.log(`Rejected notification with ID: ${notificationId}`);
    // Add backend API call to reject the request
  };

  return (
    <div className="min-h-screen bg-light-bg-color text-light-text-color dark:bg-dark-bg-color dark:text-dark-text-color">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Notifications</h1>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800"
            >
              <h2 className="text-xl font-semibold">{notification.userName}</h2>
              <p className="text-sm text-gray-500 mb-4">{notification.userEmail}</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleAccept(notification.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(notification.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Notifications;