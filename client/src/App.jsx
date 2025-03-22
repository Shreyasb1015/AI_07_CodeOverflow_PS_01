import './App.css'
import { Button } from "@/components/ui/button";
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { ThemeProvider } from "./context/Theme"; 
import { Toaster } from "sonner";
import Home from "../src/pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatPage from './pages/ChatPage';
import CreateGroup from './pages/CreateGroup';
import Experts from './pages/Experts';
import Notifications from './pages/Notifications';
import AcceptForm from "./pages/AcceptForm";
import ConfirmRequest from "./pages/ConfirmRequest";
import VideoPage from "./pages/VideoPage";
import ChattingAvatar from './pages/ChattingAvatar';
import KnowledgeBase from './pages/KnowledgeBase';
function App() {


  return (
    <ThemeProvider>
     <Router>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<ChattingAvatar />} />
          <Route path='/knowledge-base' element={<KnowledgeBase/>}/>
        </Routes>
        <Toaster position="bottom-right" richColors />
     </Router>
    </ThemeProvider>
  )
}

export default App
