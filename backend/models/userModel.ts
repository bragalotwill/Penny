import mongoose from "mongoose";
import { Types } from "mongoose";

export interface IUser extends mongoose.Document {
    username: string,
    displayName: string,
    email: string,
    password: string,
    // TODO: make pennies their own model?
    pennies: number,
    friends: Types.ObjectId[],
    posts: Types.ObjectId[],
    comments: Types.ObjectId[],
    likedComments: Types.ObjectId[],
    likedPosts: Types.ObjectId[],
    // TODO: make interest its own model
    interests: string[],
    pfp: string
};

// TODO: add phone number
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        text: true,
        required: true,
        min: 5,
        max: 20,
        unique: true
    },
    displayName: {
        type: String,
        text: true,
        required: true,
        min: 5,
        max: 20
    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true
    },
    password: {
        type: String,
        min: 6,
        max: 30,
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

const User = mongoose.model<IUser>("User", userSchema)
export default User