import React, { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import beginnerBadge from "../assets/badges/beginner.png";
import intermediateBadge from "../assets/badges/intermediate.png";
import proBadge from "../assets/badges/pro.png";
import masterBadge from "../assets/badges/master.png";
import legendBadge from "../assets/badges/legend.png";
import userProfileImage from "../assets/user-profile.jpg";
import GoogleTranslate from "../components/GoogleTranslate";
import InteractiveCircles from "../components/InteractiveCircles";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/slice/Userslice"; // Adjust the path as needed

const Profile = () => {

  

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem("currentUser");

    // Dispatch logout action to clear Redux state
    dispatch(logout());

    // Navigate to the login page
    navigate("/login");
  };

  const [userDetails] = useState({
    profileImage: userProfileImage,
    username: "Gaurav Mahadeshwar",
    location: "Titwala (W), Kalyan, Thane",
    email: "gaurav@example.com",
  });

  const [userLevel] = useState("pro");

  const allBadges = [
    { name: "Beginner", key: "beginner", image: beginnerBadge },
    { name: "Intermediate", key: "intermediate", image: intermediateBadge },
    { name: "Pro", key: "pro", image: proBadge },
    { name: "Master", key: "master", image: masterBadge },
    { name: "Legend", key: "legend", image: legendBadge },
  ];

  const getEarnedBadges = () => {
    const levelIndex = allBadges.findIndex((badge) => badge.key === userLevel);
    return allBadges.slice(0, levelIndex + 1);
  };

  return (
    <>
      <Navbar />
      <div
        className="min-h-screen bg-[#FF6000] flex items-center justify-center p-6"
        style={{
          background:
            "linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(208,85,13,0.8627) 35%, rgba(255,137,0,1) 100%)",
        }}
      >
        <style>{`
        .parent {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(4, 1fr);
          gap: 20px;
          width: 100%;
          max-width: 1200px;
          height: 90vh;
          justify-content: center;
          align-content: center;
        }

        .div1,
        .div2,
        .div3,
        .div4 {
          background: black;
          border-radius: 0.75rem;
          padding: 1.5rem;
          color: white;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6), 0 4px 10px rgba(255, 255, 255, 0.05);
          transition: box-shadow 0.3s ease;
        }
        .div1:hover,
.div2:hover,
.div3:hover,
.div4:hover {
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.1),
              0 6px 20px rgba(255, 137, 0, 0.3);
  transition: all 0.3s ease-in-out;
}



        .div1 {
          grid-row: span 2 / span 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .div2 {
          grid-row: span 2 / span 2;
          grid-column-start: 1;
          grid-row-start: 3;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
        }

        .div3 {
          grid-column: span 2 / span 2;
          grid-row: span 2 / span 2;
          grid-column-start: 2;
          grid-row-start: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          text-align: center;
        }

        .div4 {
          grid-column: span 2 / span 2;
          grid-row: span 2 / span 2;
          grid-row-start: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .badge-container {
          text-align: center;
          position: relative;
        }

        .badge-image-container {
          position: relative;
          padding: 0.5rem;
          border: 4px solid white;
          border-radius: 0.75rem;
          width: 6rem;
          height: 6rem;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        .badge-container:hover .badge-image-container::before,
        .badge-container:hover .badge-image-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.4);
          opacity: 1;
          animation: glitterAnimation 1s ease-in-out forwards;
          pointer-events: none;
        }

        @keyframes glitterAnimation {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }

        .badge-container:hover .badge-image {
          animation: badgeRotate 1s ease-in-out forwards;
        }

        @keyframes badgeRotate {
          from { transform: perspective(500px) rotateY(0deg); }
          to { transform: perspective(500px) rotateY(360deg); }
        }
      `}</style>

        <div className="parent">
          {/* Box 1 - Profile */}
          <div className="div1 w-80">
            <img
              src={userDetails.profileImage}
              alt="User"
              className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-white shadow-md"
            />
            <h2 className="text-xl font-bold">{userDetails.username}</h2>
            <p>Bio</p>
          </div>

          {/* Box 2 - Buttons Placeholder (can be extended later) */}
          <div className="div2 w-80">
            <div className="w-full flex flex-col items-center gap-3">
              {/* Placeholder */}
              <h2 className="text-xl font-semibold mb-2">Settings</h2>
              <div>
                <InteractiveCircles />
              </div>

              <ul className="list-disc list-inside text-sm">
                <li>
                  Financial newsletter{" "}
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md w-10 ml-3">
                    +
                  </button>
                </li>
                <li>
                  Technical newsletter{" "}
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md w-10 ml-2.5">
                    +
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Box 3 - Personal Info */}
          <div className="div3  w-200">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Personal Information
              </h2>
              <p className="mb-1">Email: {userDetails.email}</p>
              <p className="mb-1">Location: {userDetails.location}</p>
              <p className="mt-4 font-medium">Metadata:</p>
              <ul className="list-disc list-inside text-sm">
                <li>Member since: 2022</li>
                <li>Status: Active</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md w-40">
                Update Profile
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md w-40" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          {/* Box 4 - Achievements */}
          <div className="div4 w-full">
            <h2 className="text-xl font-semibold mb-4">Achievements</h2>
            <div className="flex space-x-6 overflow-x-auto px-2 justify-center">
              {getEarnedBadges().map((badge, index) => (
                <div key={index} className="badge-container">
                  <div className="badge-image-container">
                    <img
                      src={badge.image}
                      alt={`${badge.name} Badge`}
                      className="badge-image w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="mt-2 text-sm font-bold">{badge.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
