import React, { useState } from "react";
import { useTheme } from "../context/Theme";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer"; // Import Footer
import { toast } from "sonner";
import axios from "axios";
import { X } from "lucide-react"; // Import X icon for close button

export default function KnowledgeBase() {
  const { theme } = useTheme();
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Only PDF files are allowed!");
        return;
      }
      setFile(selectedFile);

      // Generate a preview URL for the uploaded file
      const fileURL = URL.createObjectURL(selectedFile);
      setFilePreview(fileURL);

      toast.success("File selected successfully!");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("No file selected!");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/update_knowledge_base",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Knowledge Updated successfully!");
      } else {
        toast.error("Failed to upload file!");
      }
    } catch (error) {
      toast.error("Error uploading file!");
    }
  };

  const handleClosePreview = () => {
    setFilePreview(null); // Clear the preview
    setFile(null); // Clear the file
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
        {/* Upload Section (1/3rd of the screen) */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">PDF</p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <button
            onClick={handleUpload}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!file}
          >
            Update Knowledge Base
          </button>
        </div>

        {/* File Preview Section (2/3rd of the screen) */}
        <div className="w-full md:w-2/3 flex flex-col items-center justify-center relative">
          {filePreview ? (
            <>
              {/* Close Button */}
              <button
                onClick={handleClosePreview}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="h-5 w-5" />
              </button>

              {/* PDF Preview */}
              <iframe
                src={filePreview}
                className="w-full h-[80vh] border border-gray-300 rounded-lg"
                title="PDF Preview"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[80vh] w-full border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400">
                Upload a PDF to preview it here.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}