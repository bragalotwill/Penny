import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 5,
        max: 20,
        unique: true
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    pennies: {
        type: Number,
        default: 0
    },
    friends: {
        type: Array,
        default: []
    },
    posts: {
        type: Array,
        default: []
    },
    comments: {
        type: Array,
        default: []
    },
    likedComments: {
        type: Array,
        default: []
    },
    likedPosts: {
        type: Array,
        default: []
    },
    interests: {
        type: Array,
        default: []
    },
    pfp: {
        type: String,
        default: ""
    }
}, {timestamps: true}
)

const User = mongoose.model("User", userSchema)
export default User