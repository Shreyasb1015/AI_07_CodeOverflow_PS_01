import React, { useState, useRef } from "react";
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
import { toast } from "sonner";
import axiosClient from "../api/axios_client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Import Dialog components


const ChattingAvatar = () => {
  const { theme } = useTheme();
  const [selectedModel, setSelectedModel] = useState(1);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState({
    1: [],
    2: [],
    3: [],
  });
const [isComplaintDialogOpen, setIsComplaintDialogOpen] = useState(false); // State for complaint dialog
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const avatarImages = {
    1: "/src/assets/avatar/avatar1.jpg",
    2: "/src/assets/avatar/avatar2.jpg",
    3: "/src/assets/avatar/avatar3.jpg",
  };

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    setChatHistory((prev) => ({
      ...prev,
      [selectedModel]: [...prev[selectedModel], { sender: "user", text: message }],
    }));
    setTimeout(() => {
      setChatHistory((prev) => ({
        ...prev,
        [selectedModel]: [...prev[selectedModel], { sender: "ai", text: `This is a response from Model ${selectedModel}.` }],
      }));
    }, 1000);
    setMessage("");
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });

        // Convert Blob to File (Required for API call)
        const audioFile = new File([audioBlob], "recording.mp3", {
          type: "audio/mp3",
        });

        // Create FormData and append the file
        const formData = new FormData();
        formData.append("audio", audioFile);

        try {
          const response = await axiosClient.post("http://localhost:5000/upload-audio", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Failed to upload audio");

          const data = await response.json();
          const audioURL = data.audioUrl; 

          setChatHistory((prev) => ({
            ...prev,
            [selectedModel]: [
              ...prev[selectedModel],
              { sender: "user", audio: audioURL },
            ],
          }));

          toast.success("Audio uploaded successfully!");
        } catch (error) {
          console.error("Error uploading audio:", error);
          toast.error("Failed to upload audio.");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording started...");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Microphone access denied!");
    }
  };


  const handlePlayAudio = (url) => {
    const audio = new Audio(url);
    audio.play();
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
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <Navbar />
      <div className="flex flex-col md:flex-row p-6 gap-6 flex-1">
        <div className="w-full md:w-1/4 flex flex-col items-center gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Avatar className="h-48 w-48 border-4 border-orange-500">
              <AvatarImage src={avatarImages[selectedModel]} alt="Avatar" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
          </motion.div>
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
            {[1, 2, 3].map((model) => (
              <Button
                key={model}
                variant={selectedModel === model ? "default" : "outline"}
                onClick={() => setSelectedModel(model)}
                className="w-full"
              >
                {model === 1 ? "Aether" : model === 2 ? "Nova" : "Neo"}
              </Button>
            ))}
          </div>
        </div>
        <div className="w-full md:w-3/4 flex flex-col gap-6 h-[calc(100vh-100px)]">
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
                {chat.text && (
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      chat.sender === "user"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    {chat.text}
                  </div>
                )}
                {chat.audio && (
                  <Button
                    variant="outline"
                    onClick={() => handlePlayAudio(chat.audio)}
                  >
                    <Play className="h-5 w-5" /> Play Audio
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  {chat.sender === "user" ? "You" : `Model ${selectedModel}`}
                </span>
              </motion.div>
            ))}
          </ScrollArea>
          <div className="flex gap-4 p-4 border-t">
            <Button variant="outline" >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="outline" >
              <Camera className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              onClick={handleVoiceInput}
              className={isRecording ? "bg-red-500" : ""}
            >
              {isRecording ? (
                <StopCircle className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
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
      <Footer />
    </div>
  );
};

export default ChattingAvatar;
