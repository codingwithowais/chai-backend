import mongoose , {Schema, model} from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const userSchema = new Schema({
    username:{
        type:String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type:String,
        required: true,
        lowercase: true,
        trim: true,
    },
    fullName:{
        type:String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    avatar:{
        type:String, // cloudinary 
        required: true
    },
    coverImage:{
        type:String // cloudinary
    },
    password:{
        type:String,
        required: true,
        min: [8 , "Password must be at least 8 characters"]
    },
    refreshToken:{
        type:String,
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref: "Video"
        }
    ]
} , {timestamps: true})


userSchema.pre("save" , async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password , 10);
    return next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        id: this._id,
        username: this.username,
        email: this.email
    } , process.env.ACCESS_TOKEN_SECRET , {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        id: this._id,
    } , process.env.REFRESH_TOKEN_SECRET , {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const User = model("User" , userSchema);