import mongoose, { isValidObjectId, set } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

const getAllVideos = asyncHandler(async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      query = '', 
      sortBy = 'createdAt', 
      sortType = 'desc', 
      userId 
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const searchQuery = {};
    if (query) {
      searchQuery.title = { $regex: query, $options: 'i' };
    }
    if (userId) {
      searchQuery.userId = userId;
    }

    const sortOrder = sortType === 'asc' ? 1 : -1;
    const sortQuery = { [sortBy]: sortOrder };

    const videos = await Video.find(searchQuery)
      .sort(sortQuery)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalVideos = await Video.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalVideos / limitNumber),
        totalItems: totalVideos,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos',
      error: error.message,
    });
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user._id;

  if (!(title || description)) {
    throw new ApiError(201, "Title and description are required");
  }

  const VideoLoaclPath = req.files?.videoFile?.[0]?.path;
  let thumbnailLoaclPath =
    req.files?.thumbnail?.[0]?.path || null;

  if (!VideoLoaclPath) {
    throw new ApiError(400, "Video file is required");
  }

  const video = await uploadOnCloudinary(VideoLoaclPath, "video", {
    resource_type: "video",
    transformation: [
      { quality: "auto" },
      { fetch_format: "auto" }
    ]
  });
  
  if (!video) {
    throw new ApiError(408, "Video upload failed");
  }

  let thumbnail;
  
  if (thumbnailLoaclPath) {
    thumbnail = await uploadOnCloudinary(thumbnailLoaclPath);
  } else {
    const publicId = video.public_id;
    thumbnail = {
      url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/so_3,w_300,h_200,c_fill/${publicId}.jpg`,
      public_id: `${publicId}_thumb`,
    };
  }

  const videoupload = await Video.create({
    title,
    description,
    thumbnail: thumbnail?.url || "",
    videoFile: video.url,
    duration: video.duration,
    owner: userId,
    videoPublicId: video.public_id,
    thumbnailPublicId: thumbnail?.public_id || "",
  });

  if (!videoupload) {
    throw new ApiError(500, "Something went wrong while uploading the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videoupload, "Video successfully uploaded"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  await User.updateOne(
    { _id: userId },
    { $addToSet: { watchHistory: videoId } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video successfully fetched, view count updated, and added to watch history"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const {title, description} = req.body;
  const thumbnailLoaclPath = req.file?.path

  if(!thumbnailLoaclPath){
    throw new ApiError(400,"thumbnail file missing")
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLoaclPath)

  if (!thumbnail.url) {
    throw new ApiError(500,"Something went wrong")
  }

  const newthumbnail = await Video.findByIdAndUpdate(
    videoId,
    {
        $set:{
          thumbnail:thumbnail.url
        }
    },
    {new:true},
  )

  if(newthumbnail){
    return res.status(200)
    .json(
      new ApiResponse(200, newthumbnail ,"avatar updated successfully ")
    )
  }

  if(title) {
    const updateTitle = await Video.findByIdAndUpdate(
      videoId,
      {
        $set:{
        title,
        }
      }
    )

    if (!updateTitle) {
      throw new ApiError(500,"Something went wrong while updating the title")
    }

    res.status(200)
    .json(
      new ApiResponse(200,updateTitle,"Title successfully update")
    )
  }

  if(description) {
    const updatedisc = await Video.findByIdAndUpdate(
      videoId,
      {
        $set:{
          description,
        }
      }
    )

    if (!updatedisc) {
      throw new ApiError(500,"Something went wrong while updating the description")
    }

    res.status(200)
    .json(
      new ApiResponse(200,updatedisc,"Title successfully update")
    )
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(401, "video id and is required for delete a video");
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);
  console.log(deletedVideo.videoPublicId,deletedVideo.thumbnailPublicId)

  if (deletedVideo) {
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
  const {value} = req.body;

  if (!videoId){
    throw new ApiError(400,"video id required for the toggle video information");
  }

  if (!value){
    throw new ApiError(400,"value is required for the toggle video information");
  }

  if (!value) {
    const togglechanged = await Video.findByIdAndUpdate(
      videoId,
      {
        $set:{
          isPublished:false
        }
      },{new:true}
    )
    return res.status(200)
    .json(new ApiResponse(200,togglechanged,"toggle is changed successfully"))
  }

  if (value) {
    const togglechanged = await Video.findByIdAndUpdate(
      videoId,
      {
        $set:{
          isPublished:true
        }
      },{new:true}
    )

    return res.status(200)
    .json(new ApiResponse(200,togglechanged,"toggle is changed successfully"))
  }

});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
