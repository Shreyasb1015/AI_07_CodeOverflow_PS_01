import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react"; // Import X icon for close button
import axios from "axios";

const InfiniteMirror = ({ onClose }) => {
  const videoRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [frameCount, setFrameCount] = useState(0);

  // Start the camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, // Use front camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Failed to access camera. Please allow camera permissions.");
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop()); // Stop all tracks
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
    onClose(); // Close the dialog
  };

  // Capture and send frames
  useEffect(() => {
    if (!isCameraOn) return;

    const interval = setInterval(() => {
      if (frameCount % 10 === 0 && videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convert canvas to Blob
        canvas.toBlob((blob) => {
          const formData = new FormData();
          formData.append("frame", blob, `frame_${frameCount}.jpg`);

          // Send frame to backend
          axios
            .post("http://localhost:5000/video-frame", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then((response) => {
              console.log("Frame sent successfully:", response.data);
            })
            .catch((error) => {
              console.error("Error sending frame:", error);
            });
        }, "image/jpeg");
      }
      setFrameCount((prev) => prev + 1); // Increment frame count
    }, 100); // Capture every 100ms (10 frames per second)

    return () => clearInterval(interval); // Cleanup interval
  }, [isCameraOn, frameCount]);

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Close Button */}
      <button
        onClick={stopCamera}
        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 z-10"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-lg"
      />
    </div>
  );
};

export default InfiniteMirror;