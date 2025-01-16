import mongoose, { Schema } from "mongoose";

const SubscriptionShema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
    
},{timestamps:true})

export const Subscription = mongoose.model("Subscription",SubscriptionShema)