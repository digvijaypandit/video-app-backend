import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js'
import { User } from "../models/user.mondel.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {jwt} from 'jsonwebtoken'
import dotenv from "dotenv";
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
        // console.log(error)
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
    // const coverImageLoaclPath = req.files?.coverImage[0]?.path;

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
    // console.log(username,email,password)

    if (!username && !email) {
        throw new ApiError(400,"username or email and password is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    // console.log(user)

    if (!user) {
        throw new ApiError(401,"User dose not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401,"Invalid username or password")
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);
    // console.log(user._id)

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
            $set: {
                refreshToken: undefined
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
    res.clearCookie("accessToken", options); 
    res.clearCookie("refreshToken", options); 

    return res.status(200).json(new ApiResponse(200, {}, "User logged out"));
})

const refreshAccessToken = asyncHandler(async (req,res) =>{
    const incommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
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

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}