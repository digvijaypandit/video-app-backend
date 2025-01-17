import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    try {
        const content = req.body;
        const userId = req.user._id;
    
        if(!content){
            throw new ApiError(400,"content are required")
        }

        const newTweet = await Tweet.create({content,tweetBy:userId});
    
        if(!newTweet){
            throw new ApiError(500,"Tweet not created")
        }
    
        res.status(201).json(new ApiResponse(201,"Tweet created successfully",newTweet))
    
    } catch (error) {
        throw new ApiError(500,error.message)
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}