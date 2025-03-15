import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getTotalVideoLikes,
    getTotalCommentLikes,
    getTotalTweetLikes
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);
router.route("/total/v/:videoId").get(getTotalVideoLikes);
router.route("/total/c/:commentId").get(getTotalCommentLikes);
router.route("/total/t/:tweetId").get(getTotalTweetLikes);

export default router