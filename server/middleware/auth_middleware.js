import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user_model.js";

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
    
    if (
      !user.isVerified &&
      !req.originalUrl == "/api/user/verifyEmail?otp="
    ) {
      return res
        .status(401)
        .json({ message: "Email not verified", status: false });
    }
    console.log("Request by User: ",user.name);
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error.message);
  }
});

