import mongoose from "mongoose"

const commentSchema = mongoose.Schema({
    creator: {
        type: Schema.Types.ObjectId,
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    text: {
        type: String,
        default: "",
        max: 500
    },
    pennies: {
        type: Number,
        default: 0
    },
    subComments: {
        type: Array,
        default: []
    },
    parentComment: {
        type: Schema.Types.ObjectId
    },
    parentPost: {
        type: Schema.Types.ObjectId,
        required: true
    },
    whoLiked: {
        type:  Array,
        default: []
    }
}, {timestamps: true})

const Comment = mongoose.model("Comment", commentSchema)
export default Comment