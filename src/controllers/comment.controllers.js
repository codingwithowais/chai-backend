import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    if(!videoId){
        throw new ApiError(400 , "video id is required");
    }
    const isVideoExist = await Video.exists({_id: videoId});
    if(!isVideoExist){
        throw new ApiError(404 , "video not found with this video id");
    }
    const {page = 1, limit = 10} = req.query
    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }
    const paginatedVideoComments = await Comment.aggregatePaginate(Comment.aggregate([{
        $match:{
            video: new mongoose.Types.ObjectId(videoId)
        }
},{
    $lookup:{
        from: "users",
        foreignField: "_id",
        localField: "owner",
        as: "commentUser",
        pipeline:[
            {
                $project:{
                    username: 1,
                    avatar: 1
                }
            }
        ]
    }
 
},{    
        $unwind:{
            path: "$commentUser",
            preserveNullAndEmptyArrays: true
        }
    
},{
    $addFields:{
        username: "$commentUser.username",
        avatar: "$commentUser.avatar"     
    }
},{
    $project:{
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        username: 1,
        avatar: 1
    }
},{
    $sort:{
       createdAt: -1 
    }
}]) , options)

    return res.status(200).json(new ApiResponse(200 , {
        comments: paginatedVideoComments
    } , "paginated video comments has been fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {videoId} = req.params;
    if(!videoId){
        throw new ApiError(400 , "video id is required");
    }
    const isVideoExist = await Video.exists({_id: videoId});
    if(!isVideoExist){
        throw new ApiError(404 , "video not found with this video id");
    }
    if(!(content?.trim())){
        throw new ApiError(400 , "comment content is missing and required");
    }
    const newComment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user?.id
    })

    return res.status(200).json(new ApiResponse(200 , {
        comment: newComment
    } , "new comment has been added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    if(!commentId){
        throw new ApiError(400 , "comment id is missing");
    }
    const existingComment = await Comment.findById(commentId);
    if(!existingComment){
        throw new ApiError(404 , "comment not found with this id");
    }
    if(!existingComment.owner.equals(req.user?.id)){
        throw new ApiError(403 , "unauthorized to perform this action");
    }
    const {content} = req.body;
    if(!content || !content.trim()){
        throw new ApiError(400 , "comment must not be blank");
    }
    existingComment.content = content.trim();
    await existingComment.save();
    return res.status(200).json(new ApiResponse(200 , {comment: existingComment} , "comment updated successfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    if(!commentId){
        throw new ApiError(400 , "comment id is missing");
    }
    const comment = await Comment.findById(commentId).populate("video");
    if(!comment){
        throw new ApiError(404 , "comment not found");
    }
    if(!comment.owner.equals(req.user?.id) && !comment.video?.owner.equals(req.user?.id)){
        throw new ApiError(402 , "user unauthorized to perform this action");
    }

    await Comment.findByIdAndDelete(commentId);
    return res.status(200).json(new ApiResponse(200 , {} , "comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }