import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { DIDVideoGenerator } from "./video-generator";

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
  const [loading, setLoading] = useState(false);
  const [vidUrl, setVidUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraOpen,setIsCameraOpen] = useState(false)
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
    const canvasRef = useRef(document.createElement("canvas"));
    let frameCount = 0;
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };
  const [videoGenerator] = useState(
    () =>
      new DIDVideoGenerator(
        "YmFnd2VzaHJleWFzMTAxNUBnbWFpbC5jb20:cyHc6ebyVGf-GE5oLUiqR"
      )
  );
  const sendFrame = async (imageBlob,input_text,token) => {
    const formData = new FormData();
    formData.append("image", imageBlob, "frame.jpg");
    formData.append("token", token);
    formData.append("user_input",input_text)

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/analyze-frame",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if(token ==  "end"){
        console.log("End is near")
        console.log(response)
        if(response.status == 200) {
          console.log("Token is set to end.")
          return response
        }
        else{
          toast.error("Error giving response on user emotions")
        }
      }
      const success = response.data.success;
      if (!success) {
        toast.error("Failed to send a frame");
      } else {
        console.log("Frame sent successfully:", response.data);
      }
    } catch (error) {
      if (error.response) {
        console.error("Server error:", error.response.data);
        toast.error(
          `Error: ${error.response.data.message || "Failed to send frame"}`
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server. Check network.");
      } else {
        console.error("Request error:", error.message);
        toast.error("Unexpected error occurred.");
      }
    }
  };

  const captureFrame = (isFinal, input_text) => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !canvasRef.current) {
        return reject(new Error("Video or Canvas reference is not defined"));
      }
  
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
  
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
      canvas.toBlob(async (blob) => {
        if (blob) {
          if (frameCount === 0) console.log("First frame sent");
          if (frameCount === 30) console.log("Second frame sent");
  
          if (isFinal) {
            console.log("Final frame sent");
            try {
              const res = await sendFrame(blob, input_text, "end");
              resolve(res); // Resolve the promise with the response
            } catch (error) {
              reject(error);
            }
          } else {
            sendFrame(blob, "", "continue");
            resolve(null); // No meaningful response to resolve when not final
          }
        } else {
          reject(new Error("Failed to create blob"));
        }
      }, "image/jpeg");
    });
  };
  
  useEffect(() => {
    let interval;
    if (cameraOpen) {
      interval = setInterval(() => {
        if (frameCount % 30 === 0) captureFrame();
        frameCount++;
      }, 100);
    }
    return () => clearInterval(interval);
  }, [cameraOpen]);
  const letAISpeak = async () => {
    try {
      setLoading(true);
      toast.loading("Generating video...");

      // Generate the video
      const result = await videoGenerator.generateVideo(
        recentText,
        "https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg"
      );

      if (result.success) {
        setVidUrl(result.videoUrl);
        toast.success("Video generated successfully!");
      } else {
        toast.error(`Failed to generate video: ${result.message}`);
      }
    } catch (error) {
      console.error("Error generating video:", error);
      toast.error("Error generating video");
    } finally {
      setLoading(false);
      toast.dismiss();
    }
  };

  const avatarImages = {
    1: "/src/assets/avatar/avatar1.jpg",
    2: "/src/assets/avatar/avatar2.jpg",
    3: "/src/assets/avatar/avatar4.jpg",
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
  
      let response;
      if (cameraOpen) {
        // Wait for the captureFrame promise to resolve
        response = await captureFrame(true, message);
        console.log(response);
        console.log("I got response");
        setIsCameraOpen(false);
        stopCamera();
      } else {
        response = await axiosClient.post(CHATAVATAR_URL, {
          user_input: userMessage,
        });
      }
  
      // Remove the temporary "Thinking..." message
      setChatHistory((prev) => ({
        ...prev,
        [selectedModel]: prev[selectedModel].filter((msg) => !msg.isLoading),
      }));
  
      if (response?.data && response.data.response) {
        const responseContent =
          response.data.response.content ||
          "Sorry, I couldn't process your request.";
  
        const detectedEmotion = response.data.response.detected_emotion || "neutral";
        const emotionConfidence = response.data.response.emotion_confidence || 1;
  
        // Emotion-based toast messages
        const emotionMessages = {
          happy: "We're glad you're happy and enjoying our platform! 😊",
          sad: "We're sorry to see you're feeling sad. Let us know how we can help. 💙",
          angry: "We understand you're upset. We're here to assist you. 🔧",
          fear: "It seems you're feeling concerned. Let us reassure you. 🤝",
          disgust: "We value your feedback. Let us address your concerns. 🛠️",
          surprise: "Wow, you seem surprised! Let us explain further. 🎉",
          neutral: "Thanks for reaching out! Let us assist you. 🤗",
        };
  
        // Show the toast message dynamically
        toast.info(emotionMessages[detectedEmotion] || emotionMessages["neutral"]);
  
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
  
      toast.error("Failed to get a response from the chatbot.");
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
              {vidUrl == null ? (
                <AvatarImage src={avatarImages[selectedModel]} alt="Avatar" />
              ) : (
                <video
                  src={vidUrl}
                  autoPlay
                  onEnded={() => {
                    setLoading(false);
                    setVidUrl(null);
                  }}
                ></video>
              )}
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <Button
              variant="outline"
              onClick={letAISpeak}
              disabled={loading || recentText == ""}
              className="w-full mt-4"
            >
              {loading ? "Loading ... " : "Speak"}
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

                  {chat.type === "video" && cameraOpen && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="rounded-lg"
                      style={{
                        width: "300px",
                        height: "200px",
                        objectFit: "cover",
                      }}
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
            <Button
              variant="outline"
              onClick={() => {
                if (cameraOpen) {
                  stopCamera();
                  setIsCameraOpen(false);
                } else {
                  startCamera();
                  setIsCameraOpen(true);
                  setChatHistory((prev) => ({
                    ...prev,
                    [selectedModel]: [
                      ...prev[selectedModel],
                      {
                        sender: "user",
                        type: "video",
                        file: videoRef.current
                          ? videoRef.current.srcObject
                          : null, // Store stream reference
                      },
                    ],
                  }));
                }
              }}
              className={cameraOpen ? "bg-red-500 text-white" : ""}
            >
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
