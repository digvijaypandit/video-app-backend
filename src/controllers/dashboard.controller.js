import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(400, "User ID is required to fetch channel stats.");
    }

    const stats = await Video.aggregate([
        { $match: {  owner: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: "$likes" }
            }
        }
    ]);

    const subscribers = await Subscription.countDocuments({ subscribedTo: userId });

    const channelStats = {
        totalVideos: stats[0]?.totalVideos || 0,
        totalViews: stats[0]?.totalViews || 0,
        totalLikes: stats[0]?.totalLikes || 0,
        totalSubscribers: subscribers || 0
    };

    return res.status(200).json(new ApiResponse(200, channelStats, "Channel stats fetched successfully."));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(400, "User ID is required to fetch channel videos.");
    }

    const videos = await Video.find({ owner: new mongoose.Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .select("title description views likes duration thumbnail createdAt");

    if (!videos || videos.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No videos found for this channel."));
    }

    return res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully."));
});

export { 
    getChannelStats, 
    getChannelVideos 
};
