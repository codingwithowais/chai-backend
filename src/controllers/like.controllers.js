import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(400 , "video id is missing");
    }
    const isVideoExist = await Video.exists({_id : videoId});
    if(!isVideoExist){
        throw new ApiError(404 , "video not found with this video id");
    }

    const like = await Like.findOne({likedBy : req.user?.id , video: videoId})
    let likedStatus;
    if(!like){
        await Like.create({
            likedBy: req.user?.id,
            video: videoId
        })
        likedStatus =  "Liked"
    }
    else{
        await like.deleteOne();
        likedStatus = "Unliked"
    }

    return res.status(200).json(new ApiResponse(200 , {status: likedStatus} , `video has been ${likedStatus.toLowerCase()} successfully`));

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId){
        throw new ApiError(400 , "comment id is missing");
    }
    const isCommentExist = await Comment.exists({_id : commentId});
    if(!isCommentExist){
        throw new ApiError(404 , "comment not found with this comment id");
    }

    const like = await Like.findOne({likedBy : req.user?.id , comment: commentId})
    let likedStatus;
    if(!like){
        await Like.create({
            likedBy: req.user?.id,
            comment: commentId
        })
        likedStatus =  "Liked"
    }
    else{
        await like.deleteOne();
        likedStatus = "Unliked"
    }

    return res.status(200).json(new ApiResponse(200 , {status: likedStatus} , `comment has been ${likedStatus.toLowerCase()} successfully`));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
      if(!tweetId){
        throw new ApiError(400 , "tweet id is missing");
    }
    const isTweetExist = await Tweet.exists({_id : tweetId});
    if(!isTweetExist){
        throw new ApiError(404 , "tweet not found with this tweet id");
    }

    const like = await Like.findOne({likedBy : req.user?.id , tweet: tweetId})
    let likedStatus;
    if(!like){
        await Like.create({
            likedBy: req.user?.id,
            tweet: tweetId
        })
        likedStatus =  "Liked"
    }
    else{
        await like.deleteOne();
        likedStatus = "Unliked"
    }

    return res.status(200).json(new ApiResponse(200 , {status: likedStatus} , `tweet has been ${likedStatus.toLowerCase()} successfully`));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.aggregate([{
        $match:{
            likedBy: new mongoose.Types.ObjectId(req.user?.id),
            video: {$exists: true, $ne: null}
        }
    },{
        $lookup:{
            from: "videos",
            foreignField: "_id",
            localField: "video",
            as: "videoDetails"
        }
    },{
        $unwind:{
            path: "$videoDetails",
            preserveNullAndEmptyArrays: true
        }
    },{
        $lookup:{
            from: "users",
            foreignField: "_id",
            localField: "videoDetails.owner",
            as: "ownerInfo",
            pipeline:[{
                $project:{
                    username: 1,
                    fullName: 1,
                    avatar: 1
                }
            }]
        }
    },{
      $unwind:{
        path: "$ownerInfo",
        preserveNullAndEmptyArrays: true
      }  
    },{
        $addFields:{
            "videoDetails.owner" : "$ownerInfo"
        }
    },{
        $replaceRoot:{
            newRoot: "$videoDetails"
        }
    }])

    return res.status(200).json(new ApiResponse(200 , {
        likedVideos
    }, "liked video details has been fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}