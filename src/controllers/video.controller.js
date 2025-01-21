import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, discription } = req.body;
  const userId = req.user._id;

  if (!(title || discription)) {
    throw new ApiError(201, "title and description are required");
  }

  const VideoLoaclPath = req.files?.videoFile?.[0]?.path;

  let thumbnailLoaclPath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLoaclPath = req.files.thumbnail[0].path;
  }

  if (!VideoLoaclPath) {
    throw new ApiError(400, "Video file are required");
  }

  const video = await uploadOnCloudinary(VideoLoaclPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLoaclPath);

  if (!video) {
    throw new ApiError(408, "video is requires");
  }

  const videoupload = await Video.create({
    title,
    discription,
    thumbnail: thumbnail?.url || "",
    videoFile: video.url,
    duration: video.duration,
    owner: userId,
    videoPublicId: video.public_id,
    thumbnailPublicId: thumbnail?.public_id || "",
  });

  if (!videoupload) {
    throw new ApiError(500, "Something is went wrong while upload a video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoupload, "Video successfully uploaded"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(300, "video id is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(500, "Something went wrong while finding the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video successfully fetched"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(401, "video id and is required for delete a video");
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);
  console.log(deletedVideo.videoPublicId,deletedVideo.thumbnailPublicId)

  if (deletedVideo) {
    // Delete an image
    cloudinary.uploader.destroy(
        deletedVideo.thumbnailPublicId,
      { resource_type: "image" },
      (error, result) => {
        if (error) {
          console.error("Error deleting image:", error);
        } else {
          console.log("Image deleted:", result);
        }
      }
    );

    // Delete a video
    cloudinary.uploader.destroy(
        deletedVideo.videoPublicId,
      { resource_type: "video" },
      (error, result) => {
        if (error) {
          console.error("Error deleting video:", error);
        } else {
          console.log("Video deleted:", result);
        }
      }
    );
  }

  if (!deletedVideo) {
    throw new ApiError(
      500,
      "Something went wrong while deleting an video file"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedVideo, "Video has been delete successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
