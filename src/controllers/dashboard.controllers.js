import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const stats = {};
    stats.totalVideoViews = 0;
    stats.totalVideos = 0;
    stats.totalLikes = 0
    const views = await Video.aggregate([{
        $match:{
            owner: new mongoose.Types.ObjectId(req.user?.id)
        }
    },
    {
        $lookup:{
            from: "likes",
            foreignField: "video",
            localField: "_id",
            as: "videoLikes"
        }
    },
    {
        $addFields:{
            likeCount: {$size: "$videoLikes"}
        }
    },
    {
        $group:{
            _id: "$owner",
            viewsCount: {$sum: "$views"},
            videoCount: {$sum : 1},
            totalLikes: {$sum: "$likeCount"}
        }
    }])
    if(views.length){
        stats.totalVideoViews = views[0].viewsCount
        stats.totalVideos  = views[0].videoCount
        stats.totalLikes = views[0].totalLikes
    }

    const subscribers = await Subscription.countDocuments({channel: req.user?.id});
    stats.totalSubscribers = subscribers

    return res.status(200).json(new ApiResponse(200 , {stats} , "all the stats has been fetched successfully"))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.aggregate([{
        $match:{
            owner: new mongoose.Types.ObjectId(req.user?.id)
        }
    },{
        $lookup:{
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerInfo",
            pipeline:[{
                $project:{
                    username: 1,
                    fullName: 1,
                    avatar: 1
                }
            }]
        }
    },
    {
        $unwind:{
            path: "$ownerInfo",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $project:{
            owner: 0
        }
    }
])
    return res.status(200).json(new ApiResponse(200 , {videos} , "all the videos have been fetched successfully"))
})


export {
    getChannelStats, 
    getChannelVideos
    }