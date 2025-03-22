import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user_model.js";
import { sendVerificationEmail } from "../utils/helpers.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized request", status: false });
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid AccessToken", status: false });
    }
    return res
      .status(401)
      .json({ message: "VerifiedAccessToken", status: true });
    next();
  } catch (error) {
    throw new ApiError(401, error.message);
  }
});

export const signup = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password || !role || !department) {
      return res
        .status(400)
        .json({ message: "All fields are required", status: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already in use", status: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await User.create({
      name,
      email,
      role,
      department,
      otpToVerify: otp,
      password: hashedPassword,
    });

    const accessToken = jwt.sign(
      { _id: newUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    await sendVerificationEmail(newUser.email, otp, name);

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
    res.status(201).json({
      message: "Signup successful",
      user: newUser,
      accessToken,
      status: true,
    });
  } catch (error) {
    res.status(500).json("Internal Server Error");
    throw new ApiError(500, error);
  }
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { otp } = req.query;
  const userId = req.user._id;

  try {
    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(402).json({ message: "User is already verified" });
    }

    if (user.otpToVerify !== otp) {
      return res.status(403).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", status: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", status: false });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", status: false });
    }

    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
    res
      .status(200)
      .json({ message: "Login successful", user, accessToken, status: true });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export const getUser = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (!req.user || !req.user._id) {
      return next(new ApiError(400, "User ID not found in request"));
    }

     const user = await User.findById(userId);

     if (!user) {
       return next(new ApiError(404, "User not found"));
     }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    next(new ApiError(500, "Internal Server Error"));
  }
});

export const getUsers = asyncHandler(async (req, res, next) => {
  try {
    const { type } = req.query;
    console.log(`Requested user role: ${type}`);

    const validRoles = ["Employee", "Administrator", "SupportTeam"];

    let filter = {};

    if (type && validRoles.includes(type)) {
      filter.role = type;
    }

    const users = await User.find(filter);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    next(new ApiError(500, "Internal Server Error"));
  }
});

export const getUserNotifications = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("notifications");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({
      message: "User Notifications Fetched Successfully",
      notifications: user.notifications,
    });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
