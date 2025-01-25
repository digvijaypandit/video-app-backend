import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.body;
  
    if (!videoId) {
      throw new ApiError(400, "videoId is needed for fetching all comments");
    }
  
    const allComments = await Comment.aggregatePaginate(
      Comment.aggregate([
        {
          $match: {
            video: new mongoose.Types.ObjectId(videoId),
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]),
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      }
    );
  
    if (!allComments) {
      throw new ApiError(500, "Something went wrong while fetching all comments");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, allComments, "All comments fetched successfully"));
});   

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!(videoId || content)) {
    throw new ApiError(
      400,
      "For creating a comment both video id and content is required"
    );
  }

  const commentadded = await Comment.create({
    content,
    video: videoId,
    user: req.user?._id,
  });

  if (!commentadded) {
    throw new ApiError(500, "somthing went wrong while creating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, commentadded, "comment successfully added"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!(commentId || content)) {
    throw new ApiError(
      400,
      "commentId and content is needed for the update the comment"
    );
  }

  const commentUpdated = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  if (!commentUpdated) {
    throw new ApiError(500, "something went wrong while update the comment");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, commentUpdated, "comment is successfully updated")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "comment id is needed for the delete the comment");
  }

  const commentdeleted = await Comment.findByIdAndDelete(commentId);

  if (!commentId) {
    throw new ApiError(500, "something went wrong while deleting the comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, commentdeleted, "comment successfully deleted"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
