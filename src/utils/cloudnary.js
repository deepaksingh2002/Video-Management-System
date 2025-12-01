import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if(!localFilePath) return null
            //upload the file on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: 'auto'
            })
            //file has been uploaded successfull
            fs.unlinkSync(localFilePath)
            return response;
            
        } catch (error) {
            fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload opration got failed.
            return null
        }
    }

const cloudnaryDelete = async (input) => {
    try {
        if (!input) return null;

        // Convert FULL URL → public_id
        let publicId = input;

        if (input.startsWith("http")) {
            // Example:
            // https://res.cloudinary.com/demo/image/upload/v12345/folder/image.png
            const urlParts = input.split("/");
            const fileWithExt = urlParts.pop();       
            const folder = urlParts.pop();            
            const fileName = fileWithExt.split(".")[0]; 

            publicId = `${folder}/${fileName}`;      
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
        });

        return result;
    } catch (error) {
        return null;
    }
};

   export {uploadOnCloudinary, cloudnaryDelete}