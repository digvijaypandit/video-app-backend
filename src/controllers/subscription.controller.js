import mongoose, {isValidObjectId, set} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    const userId = req.user._id;

    if (!channelId) {
        throw new ApiError(400,"channelId is required for getting channel information")
    }

    try {
        const existingSubscription = await Subscription.findOne({
          subscriber: userId,
          channel: channelId,
        });
    
        if (existingSubscription) {
          const unsubscribe = await Subscription.deleteOne({ _id: existingSubscription._id });
          return res.status(200).json(
            new ApiResponse(200,unsubscribe,"Unsubscribed successfully")
          );
        } else {
          const newSubscription = new Subscription({
            subscriber: userId,
            channel: channelId,
          });
          await newSubscription.save();
          return res.status(200).json(
            new ApiResponse(200,newSubscription,"Subscribed successfully")
          );
        }
      } catch (error) {
        console.error("Error toggling subscription:", error);
        return new ApiError(500,"Internal server error");
      }
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params

  console.log("Fetching subscribers for channel ID:",channelId);

  try {
    if (!isValidObjectId(channelId)) {
      throw new ApiError(400,"invalid id ");
    }

    const subscribers = await Subscription.find({ channel: channelId }).populate(
      "subscriber",
      "username fullName avatar coverImage"
    );

    const subscriberList = subscribers.map((sub) => sub.subscriber);

    res.status(200).json(
      new ApiResponse(200,subscribers,"Total subscribers list are fetched successfully")
    );
  } catch (error) {
    return new ApiError(200,"This total subscribers list are fetched successfully")
  }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  try {
    // Find all subscriptions where the subscriber is the given subscriberId
    const subscriptions = await Subscription.find({ subscriber: subscriberId }).populate(
      "channel",
      "username fullName avatar" // Include only necessary fields
    );

    // Extract the channel details from the subscriptions
    const channelList = subscriptions.map((sub) => sub.channel);

    res.status(200).json(
      new ApiResponse(200,subscriptions,"channel List is successfully fetched")
    );
  } catch (error) {
    console.error("Error fetching subscribed channels:", error);
    res.status(500).json(
      new ApiError(500,"something went wrong while fetching the channel list")
    );
  }
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}