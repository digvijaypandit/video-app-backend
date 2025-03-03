import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;  

  if (!videoId) {
      throw new ApiError(400, "videoId is needed for fetching all comments");
  }

  const allComments = await Comment.find({ video: videoId })
      .populate({
          path: "owner",
          select: "username avatar",
          model: "User"
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

  if (!allComments) {
      throw new ApiError(500, "Something went wrong while fetching all comments");
  }

  const totalDocs = await Comment.countDocuments({ video: videoId });
  const totalPages = Math.ceil(totalDocs / limit);

  return res.status(200).json(new ApiResponse(200, {
      docs: allComments,
      totalDocs,
      limit: parseInt(limit, 10),
      page: parseInt(page, 10),
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages
  }, "All comments fetched successfully"));
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

  // 🔄 Fix this line
  const commentadded = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,  // Changed `user` to `owner`
  });

  if (!commentadded) {
    throw new ApiError(500, "Something went wrong while creating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, commentadded, "Comment successfully added"));
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
