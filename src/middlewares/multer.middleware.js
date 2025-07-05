import multer from 'multer'
import path from 'path'
const storage = multer.diskStorage({
    destination: function(req , file , cb){
        cb(null , './public/temp');
    },
    filename: function(req , file , cb){
        const extension = path.extname(file.originalname);
        const uniqueFileName =  `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`
        cb(null , uniqueFileName);
    }
})


export const upload = multer({
    storage
})