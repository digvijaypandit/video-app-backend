import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import dotenv from "dotenv";
import mongoose from 'mongoose';
dotenv.config();

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken =user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false });

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while genreating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req,res) => {
    const {fullName,email,username,password} = req.body

    if (
        [fullName ,email,username,password].some((fields) => fields?.trim() === "")
    ) {
        throw new ApiError(400,"All fields are required");
    }

    const existedUser = await User.findOne({
        $or:[{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409,"User already exists")
    }

    const avatarLoaclPath = req.files?.avatar[0]?.path;

    let coverImageLoaclPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLoaclPath = req.files.coverImage[0].path
    }

    if (!avatarLoaclPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLoaclPath)
    const coverImage = await uploadOnCloudinary(coverImageLoaclPath)

    if(!avatar){
        throw new ApiError(408,"avatar is requires")   
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        username:username.toLowerCase(),
        email,
        password
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registring the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registed successfully")
    )

})

const loginUser = asyncHandler(async (req,res) => {
    const {email,username,password} = req.body

    if (!username && !email) {
        throw new ApiError(400,"username or email and password is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(401,"User dose not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401,"Invalid username or password")
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findByIdAndUpdate(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure:true
    }

    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(200,{user: loggedInUser, accessToken, refreshToken},"User logged In Successfully")
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure:true
    }
    

    return res.status(200).clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
})

const refreshAccessToken = asyncHandler(async (req,res) =>{
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incommingRefreshToken) {
        throw new ApiError(401,"unauthorized requset")
    }
    try {
        const decodedToken = jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if (incommingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"refresh token is expired or used")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken: newRefreshToken},
                "Access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid refresh token')
    }

})

const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid password")
    }

    user.password = newPassword;

    await user.save({validateBeforeSave:false});

    return res.status(200).json(
        new ApiResponse(200,"Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(200, req.user, "currnet user fetch successfully")
    )
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if(!email || !fullName){
        throw new ApiError(400,"all fields aer required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email,
            }
        },
        {new:true},
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "Account details updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLoaclPath = req.file?.path
    if(!avatarLoaclPath){
        throw new ApiError(400,"Avatar file id missing")
    }

    const avatar = await uploadOnCloudinary(avatarLoaclPath)

    if (!avatar.url) {
        throw new ApiError(500,"Something went wrong")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true},
    ).select("-password")

    return res.status(200).
    json(
        new ApiResponse(200, user ,"avatar updated successfully ")
    )

})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLoaclPath = req.file?.path
    if(!coverImageLoaclPath){
        throw new ApiError(400,"Cover Image file id missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLoaclPath)

    if (!coverImage.url) {
        throw new ApiError(500,"Something went wrong")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true},
    ).select("-password")

    return res.status(200).
    json(
        new ApiResponse(200, user ,"coverImage updated successfully ")
    )

})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const identifier = req.params.identifier;
    if (!identifier) {
        throw new ApiError(400, "Identifier (username or userId) is required");
    }

    let userIdCondition = null;

    // Check if the identifier is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier)) {
        userIdCondition = new mongoose.Types.ObjectId(identifier);
    }

    // Construct the $or condition dynamically
    const orConditions = [{ username: { $regex: new RegExp(`^${identifier}$`, 'i') } }];
    if (userIdCondition) {
        orConditions.push({ _id: userIdCondition });
    }

    const channel = await User.aggregate([
        {
            $match: {
                $or: orConditions
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
                subscribersCount: { $size: "$subscribers" },
                channelsSubscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User channel fetched successfully")
        );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.user._id) }
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
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $arrayElemAt: ["$owner", 0] } 
                        }
                    },
                    {
                        $sort: { updatedAt: -1 }
                    }
                ]
            }
        },
        {
            $project: { watchHistory: 1 }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}