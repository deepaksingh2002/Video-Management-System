import mongoose,{Schema} from "mongoose";

const commentSchema = Schema({
    content: {
        type: String,
        required: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    owner: {
        tpye: Schema.Types.ObjectId,
        ref: "User"
    }
},{Timestamp: true })

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);