import dotenv from 'dotenv'
dotenv.config({path: './.env'});
import { app } from './app.js';
import { dbConnection } from "./DB/db.js";


dbConnection().then(()=>{
    app.listen(process.env.PORT , ()=>{
        console.log(`server is running on port ${process.env.PORT}`);
    })
}).catch((err)=>{
    console.log("db connection failed" , err);
})