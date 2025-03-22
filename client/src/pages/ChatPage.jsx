import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosClient from "../api/axios_client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import bg from "../assets/bg.png";
import groupIcon from "../assets/groupicon.jpg";
import Picker from "emoji-picker-react";
import { socket } from "../socket";

export default function ChatPage() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const getAllUsers = async () => {
    try {
      const response = await axiosClient.get("/user/");
      setUsers(response.data.users);
    } catch (error) {
      toast("Error", {
        description: "Something went wrong while fetching users.",
        action: { label: "Close", onClick: () => console.log("Toast closed") },
      });
      console.error("Error fetching users:", error.message);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query.trim() === "") {
      setShowSuggestions(false);
      setFilteredUsers([]);
      return;
    }
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
    setShowSuggestions(true);
  };

  const getConversations = async () => {
    try {
      const response = await axiosClient.get("/chat/");
      setConversations(response.data.conversations);
      console.log(response.data.conversations);
    } catch (error) {
      toast("Error", {
        description: "Something went wrong while fetching conversations.",
        action: { label: "Close", onClick: () => console.log("Toast closed") },
      });
      console.error("Error fetching conversations:", error.message);
    }
  };
  const fetchMessages = async (conversationId) => {
    try {
      const response = await axiosClient.get(`/chat/getMessages/${conversationId}`);
      setMessages(response.data.data);
    } catch (error) {
      toast("Error", {
        description: "Something went wrong while fetching messages.",
        action: { label: "Close", onClick: () => console.log("Toast closed") },
      });
      console.error("Error fetching messages:", error.message);
    }
  };
  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    setShowOptions(false);
    fetchMessages(conversation._id);
  };
  useEffect(() => {
    if (selectedConversation) {
      socket.emit("join-conversation", {
        conversationId: selectedConversation._id,
        username: currentUser.username,
      });

      socket.on("message", (message) => {
        if (message.conversationId === selectedConversation._id) {
          setMessages((prevMessages) => {
            const isDuplicate = prevMessages.some(
              existingMsg => 
                (message.clientId && existingMsg.clientId === message.clientId) ||
                (existingMsg.content === message.content && 
                 existingMsg.sender === message.sender &&
                 Math.abs(new Date(existingMsg.createdAt).getTime() - 
                         new Date(message.createdAt || Date.now()).getTime()) < 2000)
            );
            
            return isDuplicate ? prevMessages : [...prevMessages, message];
          });
        }
      });

      socket.on("activity", (username) => {
        setTypingUser(username);
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      });

      return () => {
        socket.emit("leave-conversation", {
          conversationId: selectedConversation._id,
          username: currentUser.username,
        });
        socket.off("message");
        socket.off("activity");
      };
    }
  }, [selectedConversation, currentUser.username]);
  
const fetchConversations = async () => {
  try {
    const response = await axiosClient.get("/chat/");
    if (response.data.conversations) {
      setConversations(response.data.conversations);
    }
  } catch (error) {
    console.error("Error fetching conversations:", error);
    toast("Error", {
      description: "Failed to load conversations. Please refresh the page.",
      action: { label: "Refresh", onClick: () => window.location.reload() },
    });
  }
};


const handleStartConversation = async (user) => {
  try {
    const payload = {
      participants: [currentUser._id, user._id],
      isGroup: false,
      groupName: null,
      groupAdmin: null
    };
    
    await axiosClient.post("/chat/create", payload);
    await fetchConversations();
    setShowSuggestions(false);
    setSearchQuery("");
    const newConversation = conversations.find(conv => 
      !conv.isGroup && conv.participants.some(p => p._id === user._id)
    );

    if (newConversation) {
      setSelectedConversation(newConversation);
    }
    
    toast("Success", {
      description: `Started conversation with ${user.name}`,
      action: { label: "Close" },
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    toast("Error", {
      description: "Failed to start conversation. Please try again.",
      action: { label: "Close" },
    });
  }
};


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
  
    try {
      const tempId = Date.now().toString(); 
      const tempMessage = {
        _id: tempId,
        conversationId: selectedConversation._id,
        content: newMessage,
        sender: currentUser._id,
        createdAt: new Date().toISOString(),
        clientId: tempId
      };

      setMessages((prevMessages) => [...prevMessages, tempMessage]);   
      setNewMessage("");
      const payload = {
        conversationId: selectedConversation._id,
        content: newMessage,
        sender: currentUser._id,
        clientId: tempId
      };
      socket.emit("sendMessage", payload);
      const response = await axiosClient.post("/chat/sendMessage", payload);
      if (response.data.newMessage) {
        setMessages((prevMessages) => 
          prevMessages.map(msg => 
            msg._id === tempId ? response.data.newMessage : msg
          )
        );
      }
    } catch (error) {
      toast("Error", {
        description: "Something went wrong while sending the message.",
        action: { label: "Close" },
      });
      console.error("Error sending message:", error.message);
    }
  };

const handleTyping = (e) => {
  setNewMessage(e.target.value);

  socket.emit("activity", {
    conversationId: selectedConversation._id,
    username: currentUser.name || currentUser.username
  });
};

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  const handleUpdateGroup = () => {
    if (selectedConversation && selectedConversation.isGroup) {
      console.log("Update group conversation");
    }
  };

  const handleDeleteConversation = () => {
    if (selectedConversation) {
      console.log("Delete conversation", selectedConversation._id);
    }
  };

  useEffect(() => {
    getAllUsers();
    getConversations();
  }, []);

  const conversationHeader = () => {
    if (!selectedConversation) return null;
    if (selectedConversation.isGroup) {
      return {
        name: selectedConversation.groupName,
        image: groupIcon,
      };
    } else {
      const otherParticipant = selectedConversation.participants.find(
        (participant) => participant._id !== currentUser._id
      );
      return {
        name: otherParticipant ? otherParticipant.name : "User",
        image:
          (otherParticipant && otherParticipant.profilePic) ||
          "https://www.svgrepo.com/download/452030/avatar-default.svg",
      };
    }
  };

  const header = conversationHeader();

  return (
    <>
      <div
        className="min-h-screen"
        style={{
          backgroundColor: "var(--black-color)",
          color: "var(--white-color)",
        }}
      >
        <Navbar />

        <div className="mx-auto max-w-7xl p-4">
          <div className="relative">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search users..."
                style={{
                  backgroundColor: "var(--white-color)",
                  color: "var(--black-color)",
                }}
                onChange={handleSearch}
                value={searchQuery}
              />
              <Button
                disabled
                style={{
                  backgroundColor: "var(--gray-color)",
                  color: "var(--white-color)",
                  cursor: "not-allowed",
                  border: "2px solid var(--white-color)",
                }}
              >
                Search friends
              </Button>
              <Button
                style={{
                  backgroundColor: "var(--orange-color)",
                  color: "var(--white-color)",
                }}
                onClick={() => navigate("/create-group")}
              >
                Create Group
              </Button>
            </div>
            {showSuggestions && (
              <div
                className="absolute z-10 bg-[var(--white-color)] text-[var(--black-color)] shadow-md rounded-md mt-1 w-full"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-2 hover:bg-[var(--orange-color)] hover:text-[var(--white-color)] transition cursor-pointer"
                      style={{ width: "100%" }}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            user.profilePic ||
                            "https://www.svgrepo.com/download/452030/avatar-default.svg"
                          }
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <span className="truncate">{user.name}</span>
                      </div>
                      <Button
                        style={{
                          backgroundColor: "var(--orange-color)",
                          color: "var(--white-color)",
                        }}
                        onClick={() =>
                         handleStartConversation(user)
                        }
                      >
                        Start
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-center text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-7xl p-4 flex">
          <div
            className="w-1/3 bg-[var(--white-color)] text-[var(--black-color)] rounded-md shadow-md p-4 flex flex-col"
            style={{ minHeight: "80vh" }}
          >
            <h2 className="text-lg font-bold mb-4">Conversations</h2>
            <div className="overflow-y-auto" style={{ flex: 1 }}>
              {conversations.length > 0 ? (
                <div className="space-y-4">
                  {conversations.map((conversation) => {
                    const otherParticipant = !conversation.isGroup
                      ? conversation.participants.find(
                          (participant) =>
                            participant._id !== currentUser._id
                        )
                      : null;
                    return (
                      <div
                        key={conversation._id}
                        className="p-3 rounded-md border-2 bg-[var(--gray-color)] hover:bg-[var(--orange-color)] hover:text-[var(--white-color)] cursor-pointer transition flex items-center gap-3"
                        style={{ borderColor: "var(--orange-color)" }}
                        onClick={() => handleConversationClick(conversation)}
                      >
                        {conversation.isGroup ? (
                          <img
                            src={groupIcon}
                            alt="Group Icon"
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <img
                            src={
                              (otherParticipant && otherParticipant.profilePic) ||
                              "https://www.svgrepo.com/download/452030/avatar-default.svg"
                            }
                            alt={
                              otherParticipant
                                ? otherParticipant.name
                                : "User Avatar"
                            }
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {conversation.isGroup
                              ? conversation.groupName
                              : conversation.participants
                                  .filter(
                                    (participant) =>
                                      participant._id !== currentUser._id
                                  )
                                  .map((participant) => participant.name)
                                  .join(", ")}
                          </h3>
                          {conversation.latestMessage && (
                            <p className="text-sm truncate">
                              {conversation.latestMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  There is no conversation.
                </div>
              )}
            </div>
          </div>
          <div
            className="w-2/3 relative bg-[var(--gray-color)] rounded-md flex flex-col"
            style={{
              minHeight: "80vh",
              backgroundImage: `url(${bg})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            {selectedConversation ? (
              <>
                <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-opacity-75 bg-gray-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={header.image}
                      alt="Conversation"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <span className="font-semibold text-black">
                      {header.name}
                    </span>
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      onClick={() => setShowOptions(!showOptions)}
                    >
                      <span className="text-black text-2xl">⋮</span>
                    </Button>
                    {showOptions && (
                      <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-20">
                        <Button
                          variant="ghost"
                          className="w-full text-left px-4 py-2 hover:bg-gray-200"
                          onClick={handleBack}
                        >
                          <span className="mr-2 text-2xl">←</span> Back
                        </Button>
                        {selectedConversation.isGroup && (
                          <Button
                            variant="ghost"
                            className="w-full text-left px-4 py-2 hover:bg-gray-200"
                            onClick={handleUpdateGroup}
                          >
                            <span className="mr-2 text-2xl">✎</span> Update
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full text-left px-4 py-2 hover:bg-gray-200"
                          onClick={handleDeleteConversation}
                        >
                          <span className="mr-2 text-2xl">🗑</span> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-2">
                  {messages && messages.length > 0 ? (
                    messages.map((msg) => {
                      const isCurrentUser = msg.sender === currentUser._id;
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${
                            isCurrentUser ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg max-w-xs ${
                              isCurrentUser
                                ? "bg-orange-500 text-white"
                                : "bg-white text-black border border-orange-500"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      There are no messages.
                    </div>
                  )}
                  {isTyping && (
                    <div className="text-sm italic text-black-400 " style={{ backgroundColor: "grey" }}>
                      {typingUser} is typing...
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-300 bg-opacity-75 bg-gray-100 relative">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-2xl"
                      style={{ backgroundColor: "grey" }}
                      type="button"
                    >
                      🙂
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={handleTyping}
                      className="flex-1"
                      style={{
                        backgroundColor: "var(--white-color)",
                        color: "var(--black-color)",
                      }}
                    />
                    <Button
                      type="submit"
                      style={{
                        backgroundColor: "var(--orange-color)",
                        color: "var(--white-color)",
                      }}
                    >
                      <span className="mr-2">➤</span> Send
                    </Button>
                  </form>
                  {showEmojiPicker && (
                    <div className="absolute bottom-16 left-4 z-30">
                      <Picker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <img
                  src={bg}
                  alt="Background"
                  className="max-w-full max-h-full object-contain opacity-50"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
