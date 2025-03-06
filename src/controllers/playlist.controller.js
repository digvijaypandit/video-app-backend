import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!(name || description)) {
        throw new ApiError(400,"Name and description is needed for the create new Playlist")
    }
    
    const playlistCreated = await Playlist.create({
        name:name,
        description:description,
        onwer:req.user?._id,
    })

    if (!playlistCreated) {
        throw new ApiError(500,"something went wrong while creating a playlist")
    }

    return res.status(200)
    .json(new ApiResponse(200,playlistCreated,"new playlist create successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if(!userId){
        throw new ApiError(400,"userId is required to fetch the Playlists")
    }

    const playlists = await Playlist.find({ onwer: userId }).populate({
        path: "video",
        select: "thumbnail",
      }).populate({
        path: "onwer",
        select: "username",
      });
;

    if(playlists.length === 0){
        return res.status(200).json(new ApiResponse(200,"playlists Not found"))
    }

    return res.status(200)
    .json(new ApiResponse(200,playlists,"playlists found successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "playlistId is required to fetch the Playlist");
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("video", "title thumbnail duration views createdAt")
        .populate("onwer", "username avatar fullName"); 

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist found successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new ApiError(400,"playlist Id and Video Id is required for creating new playlist")
    }

    const videoAdded = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                video:videoId,
            }
        },{new:true}
    ).populate("video", "title thumbnail")
    .populate("onwer", "username");

    if (!videoAdded) {
        throw new ApiError(500,"something went wrong while adding video into playlist")
    }

    return res.status(200)
    .json(new ApiResponse(200,videoAdded,"video Added successfully into playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    const {playlistId, videoId} = req.params

    if(!(playlistId || videoId)){
        throw new ApiError(400,"playlist Id and Video Id is required for deleting video from playlist")
    }

    const videodeleted = await Playlist.updateOne(
        { _id: playlistId },
        { $pull: { video: videoId } }
    )
    
    if (!videodeleted) {
        throw new ApiError(500,"something went wrong while deleting video into playlist")
    }

    return res.status(200)
    .json(new ApiResponse(200,videodeleted,"video remove successfully from playlist"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if (!playlistId) {
        throw new ApiError(400,"playlist id is required for the deleting playlist")
    }

    const playlistDeletd = await Playlist.findByIdAndDelete(playlistId)

    if(!playlistDeletd){
        throw new ApiError(500,"something is went wrong while deleting the playlist")
    }

    return res.status(200)
    .json(new ApiResponse(200,playlistDeletd,"playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if(!playlistId){
        throw new ApiError(400,"playlistId is required for the update Playlist")
    }

    if(!(name || description)){
        throw new ApiError(400,"name or description is required for the update Playlist")
    }
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (description) updateFields.description = description;

    const playlistUpdated = await Playlist.findByIdAndUpdate(playlistId, { $set: updateFields }, { new: true });

    if (!playlistUpdated) {
        throw new ApiError(500, "Something went wrong while updating the playlist");
    }

    return res.status(200)
    .json(new ApiResponse(200,playlistUpdated,"playlist is updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}