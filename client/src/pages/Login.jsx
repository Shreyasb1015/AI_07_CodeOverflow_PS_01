/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosClient from "../api/axios_client";
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { login } from '../redux/slice/Userslice';

const Login = () => {

  const navigate = useNavigate();
  const dispatch=useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axiosClient.post("/user/login", { email, password });
      if (response.status == 200) {
        toast("Login Successful", {
          description: "You have successfully logged into your account.",
          action: { label: "Close" },
        });
        console.log(response.data.user);
        dispatch(login(response.data.user));
        localStorage.setItem("currentUser", JSON.stringify(response.data.user));


        setTimeout(()=>{
          navigate('/');
        },2000);
        
      } else {
        toast("Login Failed", {
          description: response.data.message || "Invalid email or password.",
          action: { label: "Close" },
        });
      }
    } catch (error) {
      toast("Login Error", {
        description: "Something went wrong. Please try again later.",
        action: { label: "Close" },
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="w-1/2 p-8 flex flex-col justify-center"
        style={{ backgroundColor: "var(--black-color)" }}
      >
        <h2
          className="text-4xl mb-6 font-bold"
          style={{ color: "var(--white-color)" }}
        >
          Welcome back
        </h2>
        <Label
          className="block mb-2 text-sm font-medium"
          style={{ color: "var(--white-color)" }}
        >
          Email
        </Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ color: "var(--white-color)" }}
        />
        <Label
          className="block mb-2 text-sm font-medium mt-2"
          style={{ color: "var(--white-color)" }}
        >
          Password
        </Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          style={{ color: "var(--white-color)" }}
        />
        <div className="flex items-center justify-between mb-6 mt-4">
          <div className="flex items-center gap-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms" style={{ color: "var(--white-color)" }}>
              Accept terms and conditions
            </Label>
          </div>
          <a
            href="#"
            className="text-sm hover:underline"
            style={{ color: "var(--orange-color)" }}
          >
            Forgot password?
          </a>
        </div>
        <Button
          className="w-full py-2 rounded text-sm font-semibold bg-[var(--orange-color)] text-[var(--white-color)] hover:opacity-90"
          onClick={handleLogin}
        >
          Sign in to your account
        </Button>
        <div
          className="mt-4 text-center text-sm"
          style={{ color: "var(--white-color)" }}
        >
          Don’t have an account?{" "}
          <a
            href="register"
            className="font-medium hover:underline"
            style={{ color: "var(--orange-color)" }}
          >
            Sign up
          </a>
        </div>
      </div>
      <div
  className="w-1/2 flex flex-col justify-center p-8"
  style={{ backgroundColor: "var(--orange-color)" }}
>
  <div className="max-w-md mx-auto">
    <h1
      className="text-4xl font-bold mb-4"
      style={{ color: "var(--white-color)" }}
    >
      Your ERP, Simplified
    </h1>
    <p className="text-base mb-4" style={{ color: "var(--white-color)" }}>
      Step into the future of enterprise resource planning with EchoMind. From GST compliance to production workflows, experience seamless, AI-driven support that feels like talking to an expert.
    </p>
    <div className="flex items-center mt-4">
      <p
        className="text-base font-semibold mr-4"
        style={{ color: "var(--white-color)" }}
      >
        Many Happy Customers
      </p>
      <div className="flex -space-x-4">
        <Avatar className="relative z-30 border-2 border-white">
          <AvatarImage
            src="https://images.unsplash.com/photo-1552058544-f2b08422138a"
            alt="@avatar1"
          />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
        <Avatar className="relative z-20 border-2 border-white">
          <AvatarImage
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb"
            alt="@avatar2"
          />
          <AvatarFallback>CD</AvatarFallback>
        </Avatar>
        <Avatar className="relative z-10 border-2 border-white">
          <AvatarImage
            src="https://images.unsplash.com/photo-1511367461989-f85a21fda167"
            alt="@avatar3"
          />
          <AvatarFallback>EF</AvatarFallback>
        </Avatar>
        <Avatar className="relative z-0 border-2 border-white">
          <AvatarImage
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9"
            alt="@avatar4"
          />
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
      </div>
    </div>
  </div>
</div>
    </div>
  );
};

export default Login;
