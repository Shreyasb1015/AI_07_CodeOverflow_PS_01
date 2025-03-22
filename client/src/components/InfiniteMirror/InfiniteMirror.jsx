import React, { useEffect, useRef, useState } from "react";
import { X, Send, Smile } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosClient from "../../api/axios_client";
import { ANALYZEFRAME_URL } from "../../api/flask_routes.js";

const InfiniteMirror = ({ onClose, onEmotionResponse }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [currentEmotion, setCurrentEmotion] = useState("neutral");
  const [message, setMessage] = useState("");
  const [isProcessingFinal, setIsProcessingFinal] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const frameIntervalRef = useRef(null);

  // Start camera when component mounts
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
        toast.success("Camera started. Your emotions are being analyzed.");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera. Please allow camera permissions.");
    }
  };

  // Stop camera when component unmounts or user closes
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
    
    // Clear frame processing interval
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    onClose();
  };

  // Process a single frame for emotion detection
  const processFrame = async (isFinal = false) => {
    if (!videoRef.current || !canvasRef.current || !isCameraOn) return;

    try {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const video = videoRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw the current frame on the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append("image", blob, `frame_${frameCount}.jpg`);
        
        // For final frame, add user's message and token=end
        if (isFinal) {
          formData.append("token", "end");
          formData.append("user_input", message);
        } else {
          formData.append("token", "continue");
        }

        try {
          const response = await axiosClient.post(ANALYZEFRAME_URL, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          // Handle response
          if (response.data) {
            // For intermediate frames, update the detected emotion
            if (!isFinal) {
              if (response.data.detected_emotion && response.data.detected_emotion !== "unknown") {
                setCurrentEmotion(response.data.detected_emotion);
              }
              // Store session ID if provided
              if (response.data.session_id && !sessionId) {
                setSessionId(response.data.session_id);
              }
            } 
            // For final frame, process the complete response
            else {
              if (onEmotionResponse && typeof onEmotionResponse === "function") {
                onEmotionResponse(response.data);
              }
              setIsProcessingFinal(false);
              stopCamera(); // Close the camera after final processing
            }
          }
        } catch (error) {
          console.error("Error sending frame:", error);
          if (isFinal) {
            toast.error("Error processing your message with emotion analysis");
            setIsProcessingFinal(false);
          }
        }
      }, "image/jpeg", 0.9); // Higher quality for better emotion detection

    } catch (error) {
      console.error("Error processing frame:", error);
      if (isFinal) {
        setIsProcessingFinal(false);
      }
    }
  };

  // Handle sending the final message with emotion context
  const handleSendMessage = () => {
    if (!message.trim() || isProcessingFinal) return;
    
    setIsProcessingFinal(true);
    toast.info("Processing your message with emotion context...");
    
    // Process the final frame with the message
    processFrame(true);
  };

  // Set up frame processing interval when camera is on
  useEffect(() => {
    if (!isCameraOn) return;

    // Process frames every 2 seconds (not too frequent to avoid overwhelming the server)
    frameIntervalRef.current = setInterval(() => {
      processFrame(false);
      setFrameCount((prev) => prev + 1);
    }, 2000);

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    };
  }, [isCameraOn]);

  // Start camera when component mounts
  useEffect(() => {
    startCamera();

    // Clean up on unmount
    return () => {
      stopCamera();
    };
  }, []);

  // Get color for emotion indicator
  const getEmotionColor = (emotion) => {
    const colors = {
      happy: "bg-green-500",
      sad: "bg-blue-500",
      angry: "bg-red-500",
      fear: "bg-purple-500",
      disgust: "bg-yellow-500",
      surprise: "bg-pink-500",
      neutral: "bg-gray-400",
      unknown: "bg-gray-300"
    };
    
    return colors[emotion] || "bg-gray-400";
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Close button */}
      <button
        onClick={stopCamera}
        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 z-10"
        disabled={isProcessingFinal}
      >
        <X className="h-5 w-5" />
      </button>

      {/* Camera feed */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover rounded-t-lg"
        />
        
        {/* Hidden canvas for processing frames */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Emotion indicator */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1.5 rounded-full">
          <Smile className="h-4 w-4" />
          <div className={`w-3 h-3 rounded-full ${getEmotionColor(currentEmotion)}`}></div>
          <span className="text-sm capitalize">{currentEmotion}</span>
        </div>
      </div>

      {/* Message input area */}
      <div className="p-3 border-t bg-background flex gap-2 items-center">
        <Input
          placeholder="Type your message with emotion context..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={isProcessingFinal}
          className="flex-1"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!message.trim() || isProcessingFinal}
          className={isProcessingFinal ? "opacity-50" : ""}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default InfiniteMirror;