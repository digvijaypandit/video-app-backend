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
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "Invalid User ID");
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    const allTweets = await Tweet.aggregate([
        {
            $match: { tweetBy: objectId },
        },
        {
            $lookup: {
                from: "users",
                localField: "tweetBy",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $unwind: "$user",
        },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                "user.username": 1,
                "user.email": 1,
            },
        },
        {
            $sort: { updatedAt: -1 }
        }
    ]);

    if (!allTweets || allTweets.length === 0) {
        throw new ApiError(404, "No tweets found for the user");
    }

    return res.status(200).json(
        new ApiResponse(200, allTweets, "User tweets fetched successfully")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId || req.query.tweetId;
    const {content} = req.body;
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