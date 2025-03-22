import React, { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "../context/Theme";
import {
  Mic,
  Paperclip,
  Camera,
  Send,
  AlertCircle,
  X,
  StopCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import ComplaintForm from "../components/ComplaintForm/ComplaintForm";
import { toast } from "sonner";
import axios from "axios";
import axiosClient from "../api/axios_client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CHATAVATAR_URL } from "../api/flask_routes";
import InfiniteMirror from "../components/InfiniteMirror/InfiniteMirror";

const ChattingAvatar = () => {
  const { theme } = useTheme();
  const [recentText, setRecentText] = useState("");
  const [selectedModel, setSelectedModel] = useState(1);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState({
    1: [],
    2: [],
    3: [],
  });
  const [isComplaintDialogOpen, setIsComplaintDialogOpen] = useState(false);
  const [loading,setLoading] = useState(false)
  const [vidUrl,setVidUrl] = useState(null)
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const urls = [
    "https://raw.githubusercontent.com/Shreyasb1015/AI_07_CodeOverflow_PS_01/refs/heads/main/client/src/assets/avatar/avatar1.jpg",
    "https://raw.githubusercontent.com/Shreyasb1015/AI_07_CodeOverflow_PS_01/refs/heads/main/client/src/assets/avatar/avatar2.jpg",
    "https://raw.githubusercontent.com/Shreyasb1015/AI_07_CodeOverflow_PS_01/refs/heads/main/client/src/assets/avatar/avatar3.jpg",
  ];
  const letAISpeak = async () => {
    try {
      setLoading(true)
      const response = await axios.post(
        "http://localhost:5000/generate-video",
        {
          source_url: urls[selectedModel],
          text: recentText,
        }
      );
       const videoUrl = response.data.video_url;
       setVidUrl(videoUrl)
       setLoading(false)
    } catch (error) {
      console.log("Error in speaking ai");
      toast.error("AI cannot speak")
    }
  };

  const avatarImages = {
    1: "/src/assets/avatar/avatar1.jpg",
    2: "/src/assets/avatar/avatar2.jpg",
    3: "/src/assets/avatar/avatar3.jpg",
  };

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    setChatHistory((prev) => ({
      ...prev,
      [selectedModel]: [
        ...prev[selectedModel],
        { sender: "user", text: message },
      ],
    }));

    const userMessage = message;
    setMessage("");

    try {
      setChatHistory((prev) => ({
        ...prev,
        [selectedModel]: [
          ...prev[selectedModel],
          { sender: "ai", text: "Thinking...", isLoading: true },
        ],
      }));

      const response = await axiosClient.post(CHATAVATAR_URL, {
        user_input: userMessage,
      });

      // Remove the temporary "Thinking..." message
      setChatHistory((prev) => ({
        ...prev,
        [selectedModel]: prev[selectedModel].filter((msg) => !msg.isLoading),
      }));

      if (response.data && response.data.response) {
        const responseContent =
          response.data.response.content ||
          "Sorry, I couldn't process your request.";

        setChatHistory((prev) => ({
          ...prev,
          [selectedModel]: [
            ...prev[selectedModel],
            {
              sender: "ai",
              text: responseContent,
              responseCode: response.data.response.response_code,
              moduleReference: response.data.response.module_reference,
              relatedTransactions: response.data.response.related_transactions,
              suggestedReports: response.data.response.suggested_reports,
            },
          ],
        }));
        setRecentText(responseContent);
      } else {
        setChatHistory((prev) => ({
          ...prev,
          [selectedModel]: [
            ...prev[selectedModel],
            {
              sender: "ai",
              text: "Sorry, I received an invalid response format.",
            },
          ],
        }));
      }
    } catch (error) {
      console.error("Error sending message to chatbot:", error);

      setChatHistory((prev) => ({
        ...prev,
        [selectedModel]: prev[selectedModel].filter((msg) => !msg.isLoading),
      }));

      setChatHistory((prev) => ({
        ...prev,
        [selectedModel]: [
          ...prev[selectedModel],
          {
            sender: "ai",
            text: "Sorry, I encountered an error while processing your request. Please try again.",
          },
        ],
      }));

      toast.error("Failed to get response from the chatbot.");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    const tempMessage = {
      sender: "user",
      file: previewURL,
      type: file.type.startsWith("image") ? "image" : "video",
      uploading: true,
    };

    setChatHistory((prev) => ({
      ...prev,
      [selectedModel]: [...prev[selectedModel], tempMessage],
    }));

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/image-chat",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data && response.data.response) {
        const responseContent =
          response.data.response.content ||
          "Sorry, I couldn't process your request.";

        setChatHistory((prev) => ({
          ...prev,
          [selectedModel]: [
            ...prev[selectedModel],
            {
              sender: "ai",
              text: responseContent,
              responseCode: response.data.response.response_code,
              moduleReference: response.data.response.module_reference,
              relatedTransactions: response.data.response.related_transactions,
              suggestedReports: response.data.response.suggested_reports,
            },
          ],
        }));
        setRecentText(responseContent);
      } else {
        setChatHistory((prev) => ({
          ...prev,
          [selectedModel]: [
            ...prev[selectedModel],
            {
              sender: "ai",
              text: "Sorry, I received an invalid response format.",
            },
          ],
        }));
      }

      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file.");
    }
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

        // Add a loading message
        setChatHistory((prev) => ({
          ...prev,
          [selectedModel]: [
            ...prev[selectedModel],
            { sender: "user", text: "Recording audio...", isLoading: true },
          ],
        }));

        const audioFile = new File([audioBlob], "recording.wav", {
          type: "audio/wav",
        });

        const formData = new FormData();
        formData.append("audio", audioFile);

        try {
          // Indicate that speech processing is happening
          toast.loading("Processing your speech...");

          const response = await axiosClient.post(
            "http://localhost:5000/transcribe",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          // Remove loading message
          setChatHistory((prev) => ({
            ...prev,
            [selectedModel]: prev[selectedModel].filter((msg) => msg.isLoading),
          }));

          // Process the response
          if (response.data && response.data.response) {
            // Get the transcribed text
            const transcribedText =
              response.data.transcription?.text ||
              "Audio could not be transcribed";

            // Get AI's response content
            const responseContent =
              response.data.response.content ||
              "Sorry, I couldn't process your audio message.";

            // Add the user's transcribed message to the chat
            setChatHistory((prev) => ({
              ...prev,
              [selectedModel]: [
                ...prev[selectedModel],
                {
                  sender: "user",
                  text: `🎤 ${transcribedText}`,
                  audio: URL.createObjectURL(audioBlob), // Include playable audio
                },
              ],
            }));

            // Add the AI's response
            setChatHistory((prev) => ({
              ...prev,
              [selectedModel]: [
                ...prev[selectedModel],
                {
                  sender: "ai",
                  text: responseContent,
                  responseCode: response.data.response.response_code,
                  moduleReference: response.data.response.module_reference,
                  relatedTransactions:
                    response.data.response.related_transactions,
                  suggestedReports: response.data.response.suggested_reports,
                },
              ],
            }));
            setRecentText(responseContent);
            toast.success("Audio processed successfully!");

            // If there are source documents, show a notification
            if (
              response.data.source_docs &&
              response.data.source_docs.length > 0
            ) {
              toast.info(
                `Found ${response.data.source_docs.length} relevant sources`
              );
            }
          } else {
            // Handle error case
            setChatHistory((prev) => ({
              ...prev,
              [selectedModel]: [
                ...prev[selectedModel],
                { sender: "user", audio: URL.createObjectURL(audioBlob) },
                {
                  sender: "ai",
                  text: "Sorry, I received an invalid response format for your audio.",
                },
              ],
            }));
            toast.error("Failed to process audio response.");
          }
        } catch (error) {
          console.error("Error processing audio:", error);

          // Remove loading message
          setChatHistory((prev) => ({
            ...prev,
            [selectedModel]: prev[selectedModel].filter((msg) => msg.isLoading),
          }));

          // Add error messages
          setChatHistory((prev) => ({
            ...prev,
            [selectedModel]: [
              ...prev[selectedModel],
              { sender: "user", audio: URL.createObjectURL(audioBlob) },
              {
                sender: "ai",
                text: "Sorry, I encountered an error while processing your audio. Please try again.",
              },
            ],
          }));
          toast.error(
            "Failed to process audio. " +
              (error.response?.data?.error || error.message)
          );
        }

        // Clean up the stream after processing
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info(
        "Recording started... Press the microphone button again to stop."
      );
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Microphone access denied!");
    }
  };

  const handlePlayAudio = (url) => {
    const audio = new Audio(url);
    audio.play();
  };

  const handleComplaintSubmit = async (issueType, description) => {
    try {
      const response = await axiosClient.post("/complaint", {
        issueType,
        description,
      });
      if (response.data.success === true) {
        toast.success("Complaint filed successfully");
        setIsComplaintDialogOpen(false);
      }
    } catch (error) {
      toast.error("Error complaining.");
    }
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
              {
                vidUrl == null ? <AvatarImage src={avatarImages[selectedModel]} alt="Avatar" />
                : <video src={vidUrl} onEnded={()=>{
                  setLoading(false)
                  setVidUrl(null)
                }}></video>
              }
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              onClick={letAISpeak}
              className="w-full mt-4"
            >
              {
                loading ? "Loading ... " : "Speak"
              }
            </Button>
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

            <Dialog
              open={isComplaintDialogOpen}
              onOpenChange={setIsComplaintDialogOpen}
            >
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
        <div className="w-full md:w-3/4 flex flex-col gap-6 h-[calc(100vh-100px)]">
          <ScrollArea className="flex-1 p-4 rounded-lg border bg-background overflow-y-auto">
            <div className="flex flex-col">
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
                      <Send className="h-5 w-5" /> Play Audio
                    </Button>
                  )}
                  {chat.file && chat.type === "image" && (
                    <img
                      src={chat.file}
                      alt="Uploaded"
                      className="max-w-[80%] rounded-lg"
                    />
                  )}
                  {chat.file && chat.type === "video" && (
                    <video
                      src={chat.file}
                      controls
                      className="max-w-[80%] rounded-lg"
                    />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {chat.sender === "user" ? "You" : `Model ${selectedModel}`}
                  </span>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-4 p-4 border-t">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current.click()}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileUpload}
              accept="image/*, video/*"
            />
            <Dialog
              open={isCameraDialogOpen}
              onOpenChange={setIsCameraDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Camera className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-4xl h-[80vh] left-0 transform translate-x-0">
                <DialogHeader>
                  <DialogTitle>Infinite Mirror</DialogTitle>
                </DialogHeader>
                <InfiniteMirror onClose={() => setIsCameraDialogOpen(false)} />
              </DialogContent>
            </Dialog>
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
