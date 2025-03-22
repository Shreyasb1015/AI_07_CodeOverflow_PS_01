/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Video, Upload, Send, ChevronDown } from "lucide-react";
import { CHATBOT_URL } from "../../api/flask_routes";
import axios from "axios";
import {toast} from "sonner"


const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [file, setFile] = useState(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async() => {
    if (message.trim() || file) {
      const newMessage = {
        text: message,
        file: file ? URL.createObjectURL(file) : null,
        sender: "user",
      };
      setChat([...chat, newMessage]);
      setMessage("");
      setFile(null);

      const result=await axios.post(CHATBOT_URL, { user_input: message });
      const botMessage = {
        text: result.data.response,
        sender: "bot",
      };
      setChat((prevChat) => [...prevChat, botMessage]);
      
    }
  };

  const handleVoiceInput = () => {
    if(speechSynthesis.speaking){
      speechSynthesis.cancel();
    }
    else{

      const lastBotMessage = chat.slice().reverse().find((msg) => msg.sender === "bot");
      if (lastBotMessage) {
        const utterance = new SpeechSynthesisUtterance(lastBotMessage.text);
        speechSynthesis.speak(utterance);
      } else {
        toast("Error", {
                description:
                  "Voice is only for reading bot messages.",
                action: {
                  label: "Close",
                  onClick: () => console.log("Toast closed"),
                },
              });
      }
    }
    
  };

  const handleVideoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFile(file);
      }
    };
    input.click();
  };

  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setFile(file);
      }
    };
    input.click();
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Chatbot Icon */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChatbot}
        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-lg"
      >
        {isOpen ? (
          <ChevronDown className="w-8 h-8 text-white dark:text-slate-900" /> // "V" icon when dialog is open
        ) : (
          <img
            src="src/assets/chatbot.gif" // Replace with your chatbot icon path
            alt="Chatbot"
            className="w-10 h-10"
          />
        )}
      </motion.div>

      {/* Chatbot Dialog */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-20 right-0 w-96 bg-background border border-primary/20 rounded-lg shadow-lg overflow-hidden"
        >
          {/* Chat Header */}
          <div className="p-4 bg-primary/10">
            <h2 className="text-lg font-semibold text-foreground">Chatbot</h2>
          </div>

          {/* Chat Messages */}
          <div className="p-4 h-64 overflow-y-auto">
            {chat.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex items-end gap-2 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* User or Bot Icon */}
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {msg.sender === "user" ? (
                    <img
                      src="src/assets/user.png" // Replace with your user icon path
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src="src/assets/bot1.png" // Replace with your bot icon path
                      alt="Bot"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`inline-block p-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-primary text-white dark:text-slate-900"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {msg.text}
                  {msg.file && (
                    <div className="mt-2">
                      {msg.file.includes("video") ? (
                        <video controls className="w-full rounded-lg">
                          <source src={msg.file} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img
                          src={msg.file}
                          alt="Uploaded file"
                          className="w-full rounded-lg"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-background border-t border-primary/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 rounded-lg border border-primary/20 bg-background text-foreground focus:outline-none focus:border-primary"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-primary text-white dark:text-slate-900 dark:rounded-full rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>

            {/* Additional Input Options */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleVoiceInput}
                className="p-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Mic size={20} />
              </button>
              <button
                onClick={handleVideoUpload}
                className="p-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Video size={20} />
              </button>
              <button
                onClick={handleFileUpload}
                className="p-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Upload size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Chatbot;