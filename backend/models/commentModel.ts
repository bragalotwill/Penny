import mongoose from "mongoose"

const commentSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    text: {
        type: String,
        text: true,
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
        type: mongoose.Schema.Types.ObjectId
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    whoLiked: {
        type:  Array,
        default: []
    }
}, {timestamps: true})

const Comment = mongoose.model("Comment", commentSchema)
export default Comment