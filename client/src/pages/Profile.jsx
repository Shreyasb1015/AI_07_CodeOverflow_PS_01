import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import beginnerBadge from "../assets/badges/beginner.png";
import intermediateBadge from "../assets/badges/intermediate.png";
import proBadge from "../assets/badges/pro.png";
import masterBadge from "../assets/badges/master.png";
import legendBadge from "../assets/badges/legend.png";
import { useTheme } from "../context/Theme";
import { Edit, Save, Upload, X } from "lucide-react";
import GoogleTranslate from "../components/googletranslatecomponent/GoogleTranslate";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/slice/Userslice";
import axiosClient from "../api/axios_client";

const Profile = () => {
  const { theme } = useTheme(); // Get the current theme (light/dark)
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [department, setDepartment] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    async function getUser() {
      try {
        const response = await axiosClient.get("/user/me");
        if (response.status === 200) {
          setUser(response.data.user);
          setName(response.data.user.name);
          setBio(response.data.user.bio || "");
          setDepartment(response.data.user.department || "");
          setProfilePic(response.data.user.profilePic || "");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }

    getUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    dispatch(logout());
    navigate("/login");
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await axiosClient.put("/user/update", {
        name,
        bio,
        department,
        profilePic,
      });
      if (response.status === 200) {
        setUser(response.data.user);
        setIsEditing(false); // Disable editing after saving
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div
        className={`min-h-screen flex items-center justify-center p-6 ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
        }`}
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
            background: ${theme === "dark" ? "#1f2937" : "#ffffff"};
            border-radius: 0.75rem;
            padding: 1.5rem;
            color: ${theme === "dark" ? "#ffffff" : "#000000"};
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
            border: 4px solid ${theme === "dark" ? "#ffffff" : "#000000"};
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
            <div className="relative">
              <img
                src={profilePic || user.profilePic}
                alt="User"
                className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-white shadow-md"
              />
              {isEditing && (
                <label
                  htmlFor="profile-pic"
                  className="absolute bottom-2 right-2 bg-orange-500 p-2 rounded-full cursor-pointer"
                >
                  <Upload className="h-4 w-4 text-white" />
                  <input
                    id="profile-pic"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xl font-bold bg-transparent border-b border-orange-500 mb-2"
              />
            ) : (
              <h2 className="text-xl font-bold">{name}</h2>
            )}
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-transparent border-b border-orange-500 mb-2"
                placeholder="Add a bio"
              />
            ) : (
              <p>{bio || "Add a bio"}</p>
            )}
          </div>

          {/* Box 2 - Settings */}
          <div className="div2 w-80">
            <div className="w-full flex flex-col items-center gap-3">
              <h2 className="text-xl font-semibold mb-2">Settings</h2>
              <GoogleTranslate />
            </div>
          </div>

          {/* Box 3 - Personal Info */}
          <div className="div3 w-200">
            <div>
              <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
              <p className="mb-1">Email: {user.email}</p>
              {isEditing ? (
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="bg-transparent border-b border-orange-500 mb-2"
                  placeholder="Department"
                />
              ) : (
                <p className="mb-1">Department: {department || "Not specified"}</p>
              )}
              <p className="mt-4 font-medium">Metadata:</p>
              <ul className="list-disc list-inside text-sm">
                <li>Member since: {new Date(user.createdAt).toLocaleDateString()}</li>
                <li>Status: Active</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md w-40 flex items-center justify-center gap-2"
                onClick={isEditing ? handleUpdateProfile : () => setIsEditing(true)}
              >
                {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                {isEditing ? "Save" : "Update Profile"}
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md w-40 flex items-center justify-center gap-2"
                onClick={handleLogout}
              >
                <X className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Box 4 - Achievements */}
          <div className="div4 w-full">
            <h2 className="text-xl font-semibold mb-4">Achievements</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="badge-container">
                <div className="badge-image-container">
                  <img src={beginnerBadge} alt="Beginner Badge" className="badge-image" />
                </div>
                <p className="mt-2">Beginner</p>
              </div>
              <div className="badge-container">
                <div className="badge-image-container">
                  <img src={intermediateBadge} alt="Intermediate Badge" className="badge-image" />
                </div>
                <p className="mt-2">Intermediate</p>
              </div>
              <div className="badge-container">
                <div className="badge-image-container">
                  <img src={proBadge} alt="Pro Badge" className="badge-image" />
                </div>
                <p className="mt-2">Pro</p>
              </div>
              <div className="badge-container">
                <div className="badge-image-container">
                  <img src={masterBadge} alt="Master Badge" className="badge-image" />
                </div>
                <p className="mt-2">Master</p>
              </div>
              <div className="badge-container">
                <div className="badge-image-container">
                  <img src={legendBadge} alt="Legend Badge" className="badge-image" />
                </div>
                <p className="mt-2">Legend</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;