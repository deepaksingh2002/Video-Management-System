import mongoose,{ Schema } from "mongoose";

const scubcriptionSchema  = new Schema({

    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
    
}, {Timestamp: true})

export const Subscription = mongoose.model("Subscription",scubcriptionSchema);