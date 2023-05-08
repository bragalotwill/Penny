import Post from "../models/postModel.js"
import User from "../models/userModel.js"
import { Request, Response } from "express"
import { validateString, validateUsername } from "./request.js";

// TODO: Test functions
/*
@desc   Gets post data
@route  GET /api/posts
@access PUBLIC
*/
export const getPost = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body
        if (!_id || !validateString(_id)) {
            return res.status(400).send("Invalid post id.")
        }

        const post = await Post.findById(_id)
        if (!post) {
            return res.status(400).send("No post with that id found.")
        }

        return res.status(200).json(post)
    } catch(err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

/*
@desc   Makes a new post
@route  POST /api/posts/create
@access PRIVATE
*/
export const makePost = async (req: Request, res: Response) => {
    try {
        const {
            image,
            text
        } = req.body

        const user = req.user

        if (!image && !text) {
            return res.status(400).send("Post must have image or text.")
        }

        if (image && !validateString(image)) {
            // TODO: Complete link validation
            return res.status(400).send("Invalid image.")
        }

        if (text && !validateString(text, 1, 500, /[a-zA-Z0-9!@#$%^&*]+/)) {
            // TODO: Allow more characters like emojis
            return res.status(400).send("Invalid text.")
        }

        if (user.pennies < 1) {
            return res.status(400).send("User does not have enough pennies to make a post.")
        }

        const post = new Post({
            creator: user._id,
            image: image ? image:"",
            text: text ? text:""
        })

        if (!post) {
            return res.status(400).send("Invalid post data.")
        }

        const savedPost = await post.save()

        // add post id to user's posts
        try {
            await User.findByIdAndUpdate(
                user._id,
                {
                    $push: {posts: savedPost._id},
                    $set: {pennies: user.pennies - 1}
                }
            )
        } catch (err) {
            await Post.deleteOne({_id: savedPost._id})
            console.log(err)
            return res.status(500).send(err)
        }

        return res.status(201).json(savedPost)

    } catch(err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

/*
@desc   Likes a post
@route  POST /api/posts/like
@access PRIVATE
*/
export const likePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.body
        const user = req.user

        if (!postId || !validateString(postId)) {
            return res.status(400).send("Invalid post id.")
        }

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(400).send("Post not found.")
        }

        if (user.pennies < 1) {
            return res.status(400).send("User does not have enough pennies to like post")
        }

        User.findByIdAndUpdate(
            user._id,
            {
                $push: {likedPosts: postId},
                $set: {pennies: user.pennies - 1}
            }
        )

        try {
            Post.findByIdAndUpdate(
                postId,
                {
                    $push: {whoLiked: user._id},
                    $set: {pennies: post.pennies + 1}
                }
            )
        } catch (err) {
            User.findByIdAndUpdate(
                user._id,
                {
                    $pull: {likedPosts: postId},
                    $set: {pennies: user.pennies + 1}
                }
            )
            console.log(err);
            return res.status(500).send(err)
        }

        return res.status(201).json(post)

    } catch(err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

// TODO: Delete Post (how will it work with pennies?)