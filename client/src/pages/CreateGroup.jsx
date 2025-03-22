/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar/Navbar"; 
import axiosClient from "../api/axios_client";      
import { toast } from "sonner"; 
import { Button } from "@/components/ui/button"; 
import { Plus } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

 function CreateGroup() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState([]);         
  const [selectedUsers, setSelectedUsers] = useState([]); 
  const navigate = useNavigate();

  const getAllUsers = async () => {
    try {
      const response = await axiosClient.get("/user/");
      const allUsers = response.data.users;
      
     const filteredUsers = allUsers.filter((auser) => auser._id !== user._id);
      setUsers(filteredUsers);
    } catch (error) {
      toast("Error", {
        description: "Something went wrong while fetching users.",
        action: {
          label: "Close",
          onClick: () => console.log("Toast closed"),
        },
      });
      console.error("Error fetching users:", error.message);
    }
  };

  useEffect(() => {
    getAllUsers();
    console.log("Current user:", user);
  }, []);

  const handleAddUser = (user) => {
    setSelectedUsers((prev) => {
      if (!prev.find((u) => u.id === user.id)) {
        return [...prev, user];
      }
      return prev; 
    });
  };
  const handleToggleUser = (user) => {
    setSelectedUsers((prev) => {
      if (prev.find((u) => u._id === user._id)) {
        return prev.filter((u) => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }

    if (selectedUsers.length < 2) {
      toast.error("You must select at least 2 participants");
      return;
    }
    const participants = [...selectedUsers.map((user) => user._id), user._id]; // Include current user ID
    const payload = {
      participants,
      isGroup: true,
      groupName,
      groupAdmin: user._id, 
    };

    try {
      const response = await axiosClient.post("/chat/create", payload);
      toast("Group Created Successfully", {
                description: "You have successfully created group with selected users.",
                action: { label: "Close" },
              });

      setGroupName("");
      setSelectedUsers([]);
      setTimeout(()=>{
        navigate("/chat");

      },4000);
    } catch (error) {
      toast.error("Failed to create group");
      console.error("Error creating group:", error.message);
    }
  };



  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: "var(--black-color)",
        color: "var(--white-color)",
      }}
    >
      <Navbar />
      <div className="max-w-xl mx-auto mt-8 p-4 border-5 rounded-md" style={{ borderColor: "var(--orange-color)"}}>
        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: "var(--orange-color)" }}
        >
          Create a Group
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full p-2 rounded border border-gray-300"
              style={{ color: "var(--white-color)" }}
            />
          </div>
           <div>
            <label className="block font-semibold mb-2">Selected Users</label>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <span
                  key={user.id}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--orange-color)] text-[var(--white-color)] rounded-full"
                >
                  {user.name}
                  <button
                    onClick={() => handleToggleUser(user)}
                    className="text-[var(--black-color)] bg-[var(--white-color)] rounded-full px-2 py-0.5"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {selectedUsers.length === 0 && (
                <span className="text-gray-500">No users selected</span>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">Add Users</label>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={user.profilePic || "/default-avatar.png"}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span>{user.name}</span>
                  </div>

                  {/* Add/Remove Button */}
                  <Button
                    variant="default"
                    onClick={() => handleToggleUser(user)}
                    style={{
                      backgroundColor: selectedUsers.find((u) => u.id === user.id)
                        ? "var(--red-color)" // Change to red for "Remove"
                        : "var(--orange-color)", // Orange for "Add"
                      color: "var(--white-color)",
                    }}
                    className="inline-flex items-center gap-1"
                    type="button"
                  >
                    {selectedUsers.find((u) => u._id === user._id) ? "Remove" : "Add"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <Button
            type="submit"
            style={{
              backgroundColor: "var(--orange-color)",
              color: "var(--white-color)",
            }}
          >
            Create
          </Button>
        </form>
      </div>
    </div>
  );
}

export default CreateGroup;