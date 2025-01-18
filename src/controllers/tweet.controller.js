import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    try {
        const { content } = req.body;
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
    const {userId} = req.params

    if(!userId) {
        throw new ApiError(400,"Invalid User Id")
    }

    const user = await Tweet.countDocuments({tweetBy:userId})
    .then(count => {
      console.log(`Number of documents in Collection1 that reference this Collection2 ID: ${count}`);
    })
    .catch(err => {
      console.error(err);
    });
    if (!user) {
        throw new ApiError(500,"Something went wrong while finding tweets")
    }

    return res.status(200)
    .josn(
        new ApiResponse(200, user, "")
    )
    
})

const updateTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId || req.query.tweetId;
    const {content} = req.body;
    console.log(tweetId)
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400,"Invalid tweetID")
    }

    if(!content){
        throw new ApiError(400,"content is need")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content,
            }
        },{new:true}
    )

    if(!updateTweet){
        throw new ApiError(500,"Something went wrong while updateting the tweet")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,updatedTweet,"tweet has been successfully updated")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId || req.query.tweetId;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400,"Invalid tweetID")
    }

    const tweetdeleted = await Tweet.findByIdAndDelete(tweetId);

    if (!tweetdeleted) {
        throw new ApiError(500,"tweet was not delete")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,tweetdeleted,"tweet was successfully deleted")
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}