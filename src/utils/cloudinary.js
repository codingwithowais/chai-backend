import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
})

// File upload function in cloudinary

const uploadFile = async (localFilePath)=>{
    try {
        if(!localFilePath){
            return null;
        }
        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type: 'auto'
        })
        // file uploaded successfully,
        // console.log("File uploaded on cloudinary" , response.url);
        fs.unlinkSync(localFilePath);
        return response.url
    } catch (error) {
        console.log("File did not uploaded on cloudinary" , error);   
        fs.unlinkSync(localFilePath);
        return null;
    }
}
const uploadVideoFile = async (localFilePath)=>{
    try {
        if(!localFilePath){
            return null;
        }
        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type: 'auto'
        })
        // file uploaded successfully,
        // console.log("File uploaded on cloudinary" , response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.log("File did not uploaded on cloudinary" , error);   
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteFile = async(url)=>{
    if(!url){
        return;
    }
    
    const public_id_array = String(url).split("/");
    const extName = public_id_array[public_id_array.length-1];
    const public_id = String(extName).split(".")[0];
    try {
        const result = await cloudinary.uploader.destroy(public_id , {
            resource_type: "auto"
        })
        // console.log("File deleted successfully on cloudinary" , result);
        return true;
    } catch (error) {
        console.log("error deleting file" , error.message);
        return null;
    }

}

export {uploadFile, deleteFile, uploadVideoFile}