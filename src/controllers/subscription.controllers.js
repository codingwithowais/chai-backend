import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!channelId){
        throw new ApiError(400 , "channel id is required");
    }
    if(String(channelId) === String(req.user?.id)){
        throw new ApiError(400 , "user can not subscribe/unsubscribe its own channel")
    }
    const isChannelExist = await User.exists({_id : channelId});
    if(!isChannelExist){
        throw new ApiError(404 , "channel with this id does not exist");
    }
    const subscription = await Subscription.findOne({channel: channelId , subscriber: req.user?.id})
    let isSubscribed;
    if(subscription){
        await subscription.deleteOne();
        isSubscribed = false;
    }
    else{
        await Subscription.create({
            channel: channelId,
            subscriber: req.user?.id
        })
        isSubscribed = true
    }

    return res.status(200).json(new ApiResponse(200 , {} , `channel has been ${isSubscribed ? "subscribed" : "unsubscribed"} successfully` ))


})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    if(!channelId){
        throw new ApiError(400 , "channel id is required");
    }
    const isChannelExist = await User.exists({_id : channelId});
    if(!isChannelExist){
        throw new ApiError(404 , "channel not found with this channel id");
    }
    const subscriberList = await Subscription.aggregate([{
        $match:{
            channel: new mongoose.Types.ObjectId(channelId)
        }
    },{
        $lookup:{
            from: "users",
            localField: "subscriber",
            foreignField: "_id",
            as: "subscriberInfo",
            pipeline:[
                {
                    $project:{
                        username: 1,
                        fullName: 1,
                        avatar: 1
                    }
                }
            ]
        }
    },{
        $unwind:{
            path: "$subscriberInfo",
            preserveNullAndEmptyArrays: true
        }
    },{
        $addFields:{
            username: "$subscriberInfo.username",
            fullName: "$subscriberInfo.fullName",
            avatar: "$subscriberInfo.avatar"
        }
    },{
        $project:{
            username: 1,
            fullName: 1,
            avatar: 1
        }
    }])

    return res.status(200).json(new ApiResponse(200 , {subscriber: subscriberList} , "all subscriber details of the given channel are fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!subscriberId){
        throw new ApiError(400 , "subscriber id is required");
    }
    const isSubscriberExist = await User.findById(subscriberId)
    if(!isSubscriberExist){
        throw new ApiError(404 , "subscriber not found with this subscriber id");
    }
    const channelList = await Subscription.aggregate([{
        $match:{
            subscriber: new mongoose.Types.ObjectId(subscriberId)
        }
    },{
        $lookup:{
            from: "users",
            localField: "channel",
            foreignField: "_id",
            as: "channelInfo",
            pipeline:[
                {
                    $project:{
                        username: 1,
                        fullName: 1,
                        avatar: 1
                    }
                }
            ]
        }
    },{
        $unwind:{
            path: "$channelInfo",
            preserveNullAndEmptyArrays: true
        }
    },{
        $addFields:{
            username: "$channelInfo.username",
            fullName: "$channelInfo.fullName",
            avatar: "$channelInfo.avatar"
        }
    },{
        $project:{
            username: 1,
            fullName: 1,
            avatar: 1
        }
    }])

    return res.status(200).json(new ApiResponse(200 , {subscriber: channelList} , "all channel details subscribed by the subscriber are fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}