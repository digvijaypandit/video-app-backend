import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { v2 as cloudinary } from "cloudinary";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, discription} = req.body
    const userId = req.user._id;

    if (!(title || discription)) {
        throw new ApiError(201,"title and description are required")
    }

    const VideoLoaclPath = req.files?.videoFile?.[0]?.path

    let thumbnailLoaclPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailLoaclPath = req.files.thumbnail[0].path
    }

    if(!VideoLoaclPath){
        throw new ApiError(400,"Video file are required")
    }

    const video = await uploadOnCloudinary(VideoLoaclPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLoaclPath)

    if(!video){
        throw new ApiError(408,"video is requires")   
    }

    const thumbnailUrl = cloudinary.url(video.url, {
        resource_type: 'video',
        width: 300,
        height: 300,
        crop: 'fill',
        effect: 'video_thumb',
        start_offset: 10 
      });

    const videoupload = await Video.create({
        title,
        discription,
        thumbnail:thumbnail?.url || thumbnailUrl,
        videoFile:video.url,
        duration:video.duration,
        owner:userId
    })

    if (!videoupload) {
        throw new ApiError(500,"Something is went wrong while upload a video")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, videoupload ,"Video successfully uploaded")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}