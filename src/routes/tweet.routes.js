import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    getTweetsById,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middlewares.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").get(getTweetsById).patch(updateTweet).delete(deleteTweet);

export default router