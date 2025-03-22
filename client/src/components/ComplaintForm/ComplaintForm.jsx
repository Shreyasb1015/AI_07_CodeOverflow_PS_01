import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useTheme } from "../../context/Theme"; // Import the useTheme hook

const ComplaintForm = ({ onSubmit }) => {
  const { theme } = useTheme(); // Get the current theme (light/dark)
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); 

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(issueType, description); // Pass data to parent
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSubmitted ? (
        <div className="flex flex-col items-center justify-center text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <p className="text-lg font-semibold">Complaint Submitted Successfully!</p>
        </div>
      ) : (
        <>
          <div>
            <label
              className={`block text-sm font-medium ${
                theme === "dark" ? "text-white" : "text-slate-700"
              }`}
            >
              Issue Type
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className={`mt-1 block w-full p-2 border ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              required
            >
              <option value="" disabled>
                Select an issue type
              </option>
              <option value="Incorrect Response">Incorrect Response</option>
              <option value="Rude Behavior">Rude Behavior</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${
                theme === "dark" ? "text-white" : "text-gray-700"
              }`}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`mt-1 block w-full p-2 border ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-700 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              rows="4"
              placeholder="Describe your issue..."
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Submit Complaint
          </Button>
        </>
      )}
    </form>
  );
};

export default ComplaintForm;