import { User } from "../models/user.mondel.js";
import { ApiError } from "../utils/apiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import dotenv from "dotenv";
dotenv.config();

export const verifyJWT = asyncHandler(async(req, _, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log(token)
        if (!token) {
            throw ApiError(401,"Unauthorized request");
        }
    
        const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedtoken?._id).select
        ("-password -refreshToken")
        
        if(!user){
            throw new ApiError(401,"Invalid access token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})