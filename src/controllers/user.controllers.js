import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js'
import { User } from '../models/user.model.js'
import { uploadFile, deleteFile } from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken'
import e from 'express';
import mongoose from 'mongoose';

const generateRefreshAndAccessToken = async (id) => {
      const user = await User.findById(id);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      if (!refreshToken || !accessToken) {
            throw new ApiError(500, "Internal Server Error while generating access or refresh tokens");
      }
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });
      return { refreshToken, accessToken }
}

// Registering a new user

const registerUser = asyncHandler(async (req, res) => {
      // extracting all required fields from client
      const { username, email, fullName, password } = req.body;

      // validating all fields are present
      if (!username || !email || !fullName || !password) {
            throw new ApiError(400, "All fields are required");
      }

      // again checking all fields are present after trim
      if (
            [username, email, fullName, password].some((field) => field.trim() === "")
      ) {
            throw new ApiError(400, "All fields are required");
      }


      // Checking wether a user is registered with email or username

      const existingUser = await User.findOne({
            $or: [{ username }, { email }]
      })

      if (existingUser) {
            throw new ApiError(409, "user is already registered");
      }


      // File handling

      // Extracting local file paths using multer uploads
      let avatarPath;
      if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
            avatarPath = req.files.avatar[0].path;
      }
      let coverImagePath;
      if (req.files && Array.isArray(req.files.coverImage) && req.files.length > 0) {
            coverImagePath = req.files.coverImage[0].path;
      }

      // validating avatar image is given by client or not
      if (!avatarPath) {
            throw new ApiError(400, "avatar image is required");
      }

      // Uploading images on cloudinary service
      const avatar = await uploadFile(avatarPath);
      const coverImage = await uploadFile(coverImagePath);

      // If upload on cloudinary failed for avatar , throw error
      if (!avatar) {
            throw new ApiError(500, "Failed to upload avatar on server");
      }


      // User creation

      const user = await User.create({
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            fullName: fullName.trim(),
            password,
            avatar: avatar,
            coverImage: coverImage || "",
      })


      // removing password and refreshToken fields from user
      const newUser = await User.findById(user._id).select("-password -refreshToken");
      if (!newUser) {
            throw new ApiError(500, "Server error in user registration");
      }

      // finally a response with user and message 
      res.status(201).json(new ApiResponse(200, newUser, "user created successfully"));

})

// Login user controller
const loginUser = asyncHandler(async (req, res) => {
      const { email, username, password } = req.body;
      // at least one of email username must be present
      if (!email && !username) {
            throw new ApiError(400, "email or username is required");
      }
      const existingUser = await User.findOne({
            $or: [{ email }, { username }]
      })
      // user with this email or username does not exist
      if (!existingUser) {
            throw new ApiError(404, "user with this email or username is not registered");
      }
      // password verification
      const isPasswordValid = await existingUser.isPasswordCorrect(password);
      if (!isPasswordValid) {
            throw new ApiError(401, "Invalid credentials");
      }
      // Extraction of tokens 
      const { refreshToken, accessToken } = await generateRefreshAndAccessToken(existingUser._id);
      const options = {
            httpOnly: true,
            secure: true
      }
      const user = await User.findById(existingUser._id).select("-password -refreshToken");
      // response with tokens and user
      res.cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .status(200).json(new ApiResponse(200, {
                  user,
                  refreshToken,
                  accessToken
            }, "User logged in successfully"));
})

const logoutUser = asyncHandler(async (req, res) => {
      const refreshToken = req.cookies?.refreshToken;
      const accessToken = req.cookies?.accessToken;
      if (!refreshToken && !accessToken) {
            throw new ApiError(400, "Unauthorized user");
      }
      // const decodedUser = jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET);
      // if(!decodedUser){
      //       throw new ApiError(400 , "Refresh token expired");
      // }
      await User.findByIdAndUpdate(req.user?.id, {
            $unset: {
                  refreshToken: 1
            }
      })
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      res.status(200).json(new ApiResponse(200, {}, "user successfully logged out"));

})

const userProfile = asyncHandler(async (req, res) => {
      const user = await User.findById(req.user.id).select("-password -refreshToken");
      if (!user) {
            throw new ApiError(400, "user does not exist");
      }
      return res.status(200).json(new ApiResponse(200, {
            user
      }, "user profile is fetched successfully"))
})

const changePassword = asyncHandler(async (req, res) => {
      const { oldPassword, newPassword } = req.body;
      if (!newPassword) {
            throw new ApiError(400, "new password field is required");
      }
      const user = await User.findById(req.user.id);
      const isPasswordValid = await user.isPasswordCorrect(oldPassword);
      if (!isPasswordValid) {
            throw new ApiError(401, "Entered wrong password");
      }
      user.password = newPassword;
      await user.save({ validateBeforeSave: false });
      return res.status(200).json(new ApiResponse(200, {}, "password changed successfully"));
})

const updateUserDetails = asyncHandler(async (req, res) => {
      const { newFullName } = req.body;
      if (!newFullName || newFullName.trim() === "") {
            throw new ApiError(400, "full name is required");
      }
      const user = await User.findByIdAndUpdate(req.user.id, {
            $set: {
                  fullName: newFullName
            },
      }, {
            new: true
      }).select("-password -refreshToken");
      return res.status(200).json(new ApiResponse(200, { user }, "full name update successfully"));
})

const updateAvatar = asyncHandler(async (req, res) => {
      const newAvatarPath = req.file?.path;
      if (!newAvatarPath) {
            throw new ApiError(400, "new avatar file is required");
      }
      const avatarUrl = await uploadFile(newAvatarPath);
      if (!avatarUrl) {
            throw new ApiError("500", "server error while uploading avatar on cloudinary");
      }
      const oldAvatar = await User.findById(req.user.id, { avatar: 1 });
      const user = await User.findByIdAndUpdate(req.user.id, {
            $set: {
                  avatar: avatarUrl
            }
      }, {
            new: true
      }).select("-password -refreshToken");

      // deleting from cloudinary

      await deleteFile(oldAvatar);


      return res.status(200).json(new ApiResponse(200, { user }, "avatar file updated successfully"))
})


const updateCoverImage = asyncHandler(async (req, res) => {
      const newCoverPath = req.file?.path;
      if (!newCoverPath) {
            throw new ApiError(400, "new cover image file is required");
      }
      const coverImageUrl = await uploadFile(newCoverPath);
      if (!coverImageUrl) {
            throw new ApiError("500", "server error while uploading cover image on cloudinary");
      }
      const oldCoverImage = await User.findById(req.user.id, { coverImage: 1 });
      const user = await User.findByIdAndUpdate(req.user.id, {
            $set: {
                  coverImage: coverImageUrl
            }
      }, {
            new: true
      }).select("-password -refreshToken");

      await deleteFile(oldCoverImage);

      return res.status(200).json(new ApiResponse(200, { user }, "cover image file updated successfully"))
})

const userChannelDetails = asyncHandler(async (req, res) => {
      const { username } = req.params;
      if (!username || username.trim() === "") {
            throw new ApiError(400, "channel username is required");
      }

      const channelInfo = await User.aggregate([
            {
                  $match: {
                        username: username.trim().toLowerCase()
                  }
            },
            {
                  $lookup: {
                        from: "subscriptions",
                        localField: "_id",
                        foreignField: "channel",
                        as: "subscribers"
                  }
            },
            {
                  $lookup: {
                        from: "subscriptions",
                        localField: "_id",
                        foreignField: "subscriber",
                        as: "subscribedTo"
                  }
            },
            {
                  $addFields: {
                        isSubscribed: {
                              $cond: {
                                    if: {
                                          $in: [req.user?.id, {
                                                $map: {
                                                      input: "$subscribers",
                                                      as: "s",
                                                      in: "$$s.subscriber"
                                                }
                                          }]
                                    },
                                    then: true,
                                    else: false
                              }
                        },
                        subscribersCount: {
                              $size: "$subscribers"
                        },
                        channelSubscribedToCount: {
                              $size: "$subscribedTo"
                        }
                  }
            },
            {
                  $project: {
                        username: 1,
                        fullName: 1,
                        avatar: 1,
                        coverImage: 1,
                        subscribersCount: 1,
                        channelSubscribedToCount: 1,
                        isSubscribed: 1
                  }
            }
            // {
            //     $group:{
            //       _id: "$_id",
            //       username: {$first: "$username"},
            //       fullName: {$first: "$fullName"},
            //       email: {$first: "$email"},
            //       avatar: {$first: "$avatar"},
            //       coverImage: {$first: "$coverImage"},
            //       subscribersCount: {$sum: 1},
            //       subscribedTo: {$first: "$subscribedTo"},
            //       isSubscribed: {$max: "$isSubscribed"}
            //     }
            // },
            // {
            //       $addFields:{
            //             channelSubscribedToCount:{
            //                   $size: "$subscribedTo"
            //             }
            //       }
            // },
            // {
            //       $project:{
            //             subscribedTo: 0
            //       }
            // }
      ])
      if (!channelInfo.length) {
            throw new ApiError(400, "channel info could not found");
      }
      return res.status(200).json(new ApiResponse(200, {
            userChannelInfo: channelInfo[0]
      }, "user channel info fetched successfully"));

})

const userWatchHistory = asyncHandler(async (req, res) => {
      if (!req.user) {
            throw new ApiError(400, "user unauthorized");
      }
      const user = await User.aggregate([
            {
                  $match: {
                        _id: new mongoose.Types.ObjectId(req.user?.id)
                  }
            },
            {
                  $lookup: {
                        from: "videos",
                        localField: "watchHistory",
                        foreignField: "_id",
                        as: "watchHistory",
                        pipeline: [
                              {
                                    $lookup: {
                                          from: "users",
                                          localField: "owner",
                                          foreignField: "_id",
                                          as: "owner",
                                          pipeline: [
                                                {
                                                      $project: {
                                                            username: 1,
                                                            fullName: 1,
                                                            avatar: 1
                                                      }
                                                }
                                          ]
                                    }
                              },
                              {
                                    $addFields: {
                                          owner: {
                                                $first: "$owner"
                                          }
                                    }
                              }
                        ]
                  }
            }
      ])

      if (!user.length) {
            throw new ApiError(404, "user not found");
      }
      return res.status(200).json(new ApiResponse(200, {
            watchHistory: user[0].watchHistory
      }, "user watch history has been fetched successfully"));
})

export { registerUser, loginUser, logoutUser, generateRefreshAndAccessToken, userProfile, changePassword, updateUserDetails, updateAvatar, updateCoverImage, userChannelDetails, userWatchHistory }