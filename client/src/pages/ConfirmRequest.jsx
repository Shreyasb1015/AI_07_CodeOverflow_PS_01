import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const ConfirmRequest = () => {
  const navigate = useNavigate();

  // Dummy notifications data
  const notifications = [
    {
      
      id: 1,
      type: "accepted",
      expertName: "John Doe",
      meetingId: "12345",
      date: "2023-10-15",
      time: "10:00 AM",
    },
    {
      id: 2,
      type: "rejected",
      expertName: "Jane Smith",
    },
  ];

  const handleStartMeeting = (meetingId) => {
    navigate(`/video/${meetingId}`); // Navigate to VideoPage with meeting ID
  };

  return (
    <div className="min-h-screen bg-light-bg-color text-light-text-color dark:bg-dark-bg-color dark:text-dark-text-color">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Your Requests</h1>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800"
            >
              <h2 className="text-xl font-semibold">{notification.expertName}</h2>
              {notification.type === "accepted" ? (
                <>
                  <p className="text-sm text-gray-500 mb-2">
                    Meeting ID: {notification.meetingId}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Scheduled on {notification.date} at {notification.time}
                  </p>
                  <button
                    onClick={() => handleStartMeeting(notification.meetingId)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Start Meeting
                  </button>
                </>
              ) : (
                <p className="text-sm text-red-500">Your request has been rejected.</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ConfirmRequest;