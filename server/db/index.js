import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB error: ",error.message);
        process.exit(1);
        
    }

}

export default connectDB;