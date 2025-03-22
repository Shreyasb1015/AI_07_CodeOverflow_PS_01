import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { ANALYZEFRAME_URL } from "../../api/flask_routes.js";

const InfiniteMirror = ({ onClose }) => {
  const videoRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [frameCount, setFrameCount] = useState(0);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
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

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
    onClose();
  };

  useEffect(() => {
    if (!isCameraOn) return;

    const interval = setInterval(() => {
      if (frameCount % 10 === 0 && videoRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          const formData = new FormData();
          formData.append("frame", blob, `frame_${frameCount}.jpg`);

          axios
            .post(ANALYZEFRAME_URL, formData, {
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
      setFrameCount((prev) => prev + 1);
    }, 100);

    return () => clearInterval(interval);
  }, [isCameraOn, frameCount]);

  useEffect(() => {
    startCamera();
  }, []);

  return (
    <div className="relative w-full h-full">
      <button
        onClick={stopCamera}
        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 z-10"
      >
        <X className="h-5 w-5" />
      </button>

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