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
    const userId = req.param

    const objectId = toString(userId);

    if(!userId) {
        throw new ApiError(400,"Invalid User Id")
    }

    const allTweets = await User.aggregate([
        {
            $match: {tweetBy: objectId }
          },
          {
            $lookup: {
              from: "tweets",
              localField: "_id",
              foreignField: "tweetBy",
              as: "allTweets"
            }
          },
          {
            $project: {
              _id: 1,
              content: 1,
              createdAt: 1,
              updatedAt: 1,
              "user.username": 1,
              "user.email": 1 
            }
          }
    ])
    
    console.table(allTweets)
    
    if (!allTweets) {
        throw new ApiError(500,"Something went wrong while finding the tweets")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,allTweets,"tweets of user all successfully fetched")
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