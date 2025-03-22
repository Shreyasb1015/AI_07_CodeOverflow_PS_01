import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "../context/Theme";
import { Mic, Paperclip, Camera, Send, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import ComplaintForm from "../components/ComplaintForm/ComplaintForm"; // Import the ComplaintForm component
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Import Dialog components

const ChattingAvatar = () => {
  const { theme } = useTheme(); // Get the current theme (light/dark)
  const [selectedModel, setSelectedModel] = useState(1); // Selected model (1, 2, or 3)
  const [message, setMessage] = useState(""); // User input message
  const [chatHistory, setChatHistory] = useState({
    1: [], // Chat history for Model 1
    2: [], // Chat history for Model 2
    3: [], // Chat history for Model 3
  });
  const [isComplaintDialogOpen, setIsComplaintDialogOpen] = useState(false); // State for complaint dialog

  // Avatar images for each model
  const avatarImages = {
    1: "/src/assets/avatar/avatar1.jpg", // Replace with actual paths
    2: "/src/assets/avatar/avatar2.jpg",
    3: "/src/assets/avatar/avatar3.jpg",
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (message.trim() === "") return;

    // Add user message to chat history for the selected model
    setChatHistory((prev) => ({
      ...prev,
      [selectedModel]: [
        ...prev[selectedModel],
        { sender: "user", text: message },
      ],
    }));

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      setChatHistory((prev) => ({
        ...prev,
        [selectedModel]: [
          ...prev[selectedModel],
          { sender: "ai", text: `This is a response from Model ${selectedModel}.` },
        ],
      }));
    }, 1000);

    setMessage(""); // Clear input field
  };

  // Handle voice input
  const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Voice input error:", event.error);
    };
  };

  // Handle file upload
  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setChatHistory((prev) => ({
          ...prev,
          [selectedModel]: [
            ...prev[selectedModel],
            { sender: "user", text: `File: ${file.name}` },
          ],
        }));
      }
    };
    input.click();
  };

  // Handle camera input
  const handleCameraInput = () => {
    alert("Camera input is not implemented yet.");
  };

  // Handle complaint submission
  const handleComplaintSubmit = (issueType, description) => {
    console.log("Complaint Submitted:", { issueType, description });
    // Close the dialog after 2 seconds
    setTimeout(() => {
      setIsComplaintDialogOpen(false);
    }, 2000);
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-col md:flex-row p-6 gap-6 flex-1">
        {/* Left Section: Avatar and Model Selection */}
        <div className="w-full md:w-1/4 flex flex-col items-center gap-6">
          {/* Avatar Image */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Avatar className="h-48 w-48 border-4 border-orange-500">
              <AvatarImage src={avatarImages[selectedModel]} alt="Avatar" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
          </motion.div>

          {/* Model Selection */}
          <div className="flex flex-col gap-4 w-full">
            <Button
              variant={selectedModel === 1 ? "default" : "outline"}
              onClick={() => setSelectedModel(1)}
              className="w-full"
            >
              Aether
            </Button>
            <Button
              variant={selectedModel === 2 ? "default" : "outline"}
              onClick={() => setSelectedModel(2)}
              className="w-full"
            >
              Nova
            </Button>
            <Button
              variant={selectedModel === 3 ? "default" : "outline"}
              onClick={() => setSelectedModel(3)}
              className="w-full"
            >
              Neo
            </Button>

            {/* Complaint Button */}
            <Dialog open={isComplaintDialogOpen} onOpenChange={setIsComplaintDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  File a Complaint
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>File a Complaint</DialogTitle>
                </DialogHeader>
                <ComplaintForm onSubmit={handleComplaintSubmit} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Right Section: Chat Interface */}
        <div className="w-full md:w-3/4 flex flex-col gap-6 h-[calc(100vh-100px)]">
          {/* Chat History */}
          <ScrollArea className="flex-1 p-4 rounded-lg border bg-background">
            {chatHistory[selectedModel].map((chat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex flex-col gap-2 mb-4 ${
                  chat.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    chat.sender === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {chat.text}
                </div>
                <span className="text-sm text-muted-foreground">
                  {chat.sender === "user" ? "You" : `Model ${selectedModel}`}
                </span>
              </motion.div>
            ))}
          </ScrollArea>

          {/* Input Area */}
          <div className="flex gap-4 p-4 border-t">
            <Button variant="outline" onClick={handleFileUpload}>
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={handleCameraInput}>
              <Camera className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={handleVoiceInput}>
              <Mic className="h-5 w-5" />
            </Button>
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ChattingAvatar;