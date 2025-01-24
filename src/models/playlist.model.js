import mongoose,{Schema} from "mongoose";
const playlistSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    video:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video",
            required:true
        }
    ],
    onwer:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true});

export const Playlist = mongoose.model("Playlist",playlistSchema);