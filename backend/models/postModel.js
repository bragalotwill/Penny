import mongoose from "mongoose"

const postSchema = mongoose.Schema({
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
    comments: {
        type: Array,
        default: []
    },
    whoLiked: {
        type:  Array,
        default: []
    },
    tags: {
        type: Array,
        default: []
    }
}, {timestamps: true})

const Post = mongoose.model("Post", postSchema)
export default Post