import mongoose from "mongoose";
export async function dbConnection(){
    try {
        const connection = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log("Connected to DB");
        
    } catch (error) {
        console.log("DB connection failed" , err); 
    }
}


