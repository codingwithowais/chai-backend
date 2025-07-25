import mongoose , {Schema , model} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema({
    videoFile:{
        type: String, // cloudinary 
        required: true
    },
    thumbnail:{ 
        type: String, // cloudinary
        required: true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    title:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    duration:{
        type: Number,
        required: true,
    },
    views:{
        type: Number,
        default: 0
    },
    isPublished:{
        type:Boolean,
        default: true
    }
},{
    timestamps: true
})

videoSchema.plugin(mongooseAggregatePaginate);


export const Video = model("Video" , videoSchema);