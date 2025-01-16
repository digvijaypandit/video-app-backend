import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js'
import { User } from "../models/user.mondel.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'

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
    const coverImageLoaclPath = req.files?.coverImage[0]?.path;

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

export {registerUser}