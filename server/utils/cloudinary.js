import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary=async(localFilePath)=>{
    try {

        if(!localFilePath) return null;
      
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto", 
        })
        
        fs.unlinkSync(localFilePath)
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath); 
        return null;
        
    }
}

const deleteFromCloudinary=async(publicId,resource_type='image')=>{

    try {
        if(!publicId) return false;
        const response=await cloudinary.uploader.destroy(publicId,{
            type:"upload",
            resource_type:`${resource_type}`,
        });
        console.log(response);
        return true;
        
    } catch (error) {
        
        return false;
    }
}

export {uploadOnCloudinary,deleteFromCloudinary}