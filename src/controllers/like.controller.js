import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?.id;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required to toggle like.");
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        await existingLike.deleteOne();
    } else {
        await Like.create({ video: videoId, likedBy: userId });
    }

    const totalLikes = await Like.aggregate([
        { $match: { video: new mongoose.Types.ObjectId(videoId) } },
        { $count: "totalLikes" }
    ]);

    const count = totalLikes.length > 0 ? totalLikes[0].totalLikes : 0;

    return res.status(200).json(
        new ApiResponse(200, { totalLikes: count }, "Video like status toggled successfully.")
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!commentId) {
        throw new ApiError(400, "Comment ID is required to toggle like.");
    }

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingLike) {
        await existingLike.deleteOne();
    } else {
        await Like.create({ comment: commentId, likedBy: userId });
    }

    const totalLikes = await Like.aggregate([
        { $match: { comment: new mongoose.Types.ObjectId(commentId) } },
        { $count: "totalLikes" }
    ]);

    const count = totalLikes.length > 0 ? totalLikes[0].totalLikes : 0;

    return res.status(200).json(
        new ApiResponse(200, { totalLikes: count }, "Comment like status toggled successfully.")
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?.id;

    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required to toggle like.");
    }

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (existingLike) {
        await existingLike.deleteOne();
    } else {
        await Like.create({ tweet: tweetId, likedBy: userId });
    }

    const totalLikes = await Like.aggregate([
        { $match: { tweet: new mongoose.Types.ObjectId(tweetId) } },
        { $count: "totalLikes" }
    ]);

    const count = totalLikes.length > 0 ? totalLikes[0].totalLikes : 0;

    return res.status(200).json(
        new ApiResponse(200, { totalLikes: count }, "Tweet like status toggled successfully.")
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(400, "User ID is required to fetch liked videos.");
    }

    const likedVideos = await Like.aggregate([
        { $match: { likedBy: new mongoose.Types.ObjectId(userId), video: { $exists: true } } },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        { $unwind: "$videoDetails" },
        {
            $group: {
                _id: "$videoDetails._id",
                title: { $first: "$videoDetails.title" },
                description: { $first: "$videoDetails.description" },
                createdAt: { $first: "$videoDetails.createdAt" }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully.")
    );
});



export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}