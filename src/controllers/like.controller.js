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
        { 
            $match: { 
                likedBy: new mongoose.Types.ObjectId(userId), 
                video: { $exists: true } 
            } 
        },
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
            $lookup: {
                from: "users",
                localField: "videoDetails.owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        { $unwind: "$ownerDetails" },
        {
            $group: {
                _id: "$videoDetails._id",
                thumbnail: { $first: "$videoDetails.thumbnail" },
                title: { $first: "$videoDetails.title" },
                description: { $first: "$videoDetails.description" },
                duration: { $first: "$videoDetails.duration" },
                views: { $first: "$videoDetails.views" },
                updatedAt: { $first: "$videoDetails.updatedAt" },
                createdAt: { $first: "$videoDetails.createdAt" },
                owner: {
                    $first: {
                        username: "$ownerDetails.username",
                        fullName: "$ownerDetails.fullName",
                        avatar: "$ownerDetails.avatar"
                    }
                }
            }
        },
        { $sort: { updatedAt: -1 } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully.")
    );
});

const getTotalVideoLikes = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid Video ID is required.");
    }

    const totalLikes = await Like.countDocuments({ video: videoId });

    return res.status(200).json(new ApiResponse(200, { totalLikes }, "Total video likes fetched successfully."));
});

const getTotalCommentLikes = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId || !mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Valid Comment ID is required.");
    }

    const totalLikes = await Like.countDocuments({ comment: commentId });

    return res.status(200).json(new ApiResponse(200, { totalLikes }, "Total comment likes fetched successfully."));
});

const getTotalTweetLikes = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || !mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Valid Tweet ID is required.");
    }

    const totalLikes = await Like.countDocuments({ tweet: tweetId });

    return res.status(200).json(new ApiResponse(200, { totalLikes }, "Total tweet likes fetched successfully."));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getTotalVideoLikes,
    getTotalCommentLikes,
    getTotalTweetLikes
}