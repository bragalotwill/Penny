import Comment from "../models/commentModel"
import User from "../models/userModel"
import Post from "../models/postModel"
import { Request, Response } from "express"
import { validateString, validateUsername } from "./request"

/*
@desc   Gets comment data
@route  GET /api/comments
TODO: @access <REVIEW>
*/
export const getComment = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body
        if (!_id || !validateString(_id)) {
            return res.status(400).send("Invalid comment id.")
        }

        const comment = await Comment.findOne({_id})
        if (!comment) {
            return res.status(400).send("Comment not found.")
        }

        return res.status(200).json(comment)

    } catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

/*
@desc   Makes a new comment
@route  POST /api/comments
TODO: @access <REVIEW>
*/
export const makeComment = async (req: Request, res: Response) => {
    try {
        const {
            creatorId,
            postId,
            parentCommentId,
            image,
            text
        } = req.body

        if (!creatorId || !validateString(creatorId)) {
            return res.status(400).send("Invalid creator id.")
        }

        if (!postId || !validateString(postId)) {
            return res.status(400).send("Invalid post id.")
        }

        if (parentCommentId && !validateString(parentCommentId)) {
            return res.status(400).send("Invalid parent comment id.")
        }

        if (!image && !text) {
            return res.status(400).send("Comment must have text or image.")
        }

        if (!image || !validateString(image)) {
            // TODO: Complete image validation
            return res.status(400).send("Invalid image.")
        }

        if (!text || !validateString(text, 1, 500, /[a-zA-Z0-9!@#$%^&*]+/)) {
            // TODO: Add more text support
            return res.status(400).send("Invalid text.")
        }

        const user = await User.findOne({_id: creatorId})
        if (!user) {
            return res.status(400).send("Creator user could not be found.")
        }

        if (user.pennies < 1) {
            return res.status(400).send("User does not have enough pennies to make comment.")
        }

        const post = await Post.findOne({_id: postId})
        if (!post) {
            return res.status(400).send("Post could not be found.")
        }

        let parentComment = null
        if (parentCommentId && parentCommentId !== "") {
            parentComment = await Post.findOne({parentCommentId})
            if (!parentComment) {
                return res.status(400).send("Parent comment could not be found.")
            }
        }

        const comment = new Comment ({
            creator: creatorId,
            image: image ? image : "",
            text: text ? text : "",
            parentComment: parentCommentId ? parentCommentId : "",
            post: postId
        })

        if (!comment) {
            return res.status(400).send("Comment data invalid.")
        }

        const savedComment = await comment.save()

        try {
            User.updateOne(
                {_id: creatorId},
                {
                    $push: {comments: savedComment._id},
                    $set: {pennies: user.pennies - 1}
                }
            )
        } catch (err) {
            Comment.deleteOne({_id: savedComment._id})
            console.log(err)
            return res.status(500).send(err)
        }

        try {
            Post.updateOne(
                {_id: postId},
                {$push: {comments: savedComment._id}}
            )
        } catch (err) {
            Comment.deleteOne({_id: savedComment._id})
            User.updateOne(
                {_id: creatorId},
                {
                    $pull: {comments: savedComment._id},
                    $set: {pennies: user.pennies + 1}
                }
            )
            console.log(err)
            return res.status(500).send(err)
        }

        try {
            Comment.updateOne(
                {_id: parentCommentId},
                {$push: {subComments: savedComment._id}}
            )
        } catch (err) {
            Comment.deleteOne({_id: savedComment._id})
            User.updateOne(
                {_id: creatorId},
                {
                    $pull: {comments: savedComment._id},
                    $set: {pennies: user.pennies + 1}
                }
            )
            Post.updateOne(
                {_id: postId},
                {$pull: {comments: savedComment._id}}
            )
            return res.status(500).send(err)
        }

        return res.status(201).json(savedComment)

    } catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

export const likeComment = async (req: Request, res: Response) => {
    try {
        const {
            userId,
            commentId
        } = req.body

        if (!userId || !validateString(userId)) {
            return res.status(400).send("Invalid user id.")
        }

        if (!commentId || !validateString(commentId)) {
            return res.status(400).send("Invalid comment id.")
        }

        const comment = await Comment.findOne({_id: commentId})
        if (!comment) {
            return res.status(400).send("Comment not found.")
        }

        const user = await User.findOne({_id: userId})
        if (!user) {
            return res.status(400).send("User not found.")
        }

        if (user.pennies < 1) {
            return res.status(400).send("User does not have enough pennies to like comment.")
        }

        User.updateOne(
            {_id: userId},
            {
                $push: {likedComments: commentId},
                $set: {pennies: user.pennies - 1}
            }
        )

        try {
            Comment.updateOne(
                {_id: commentId},
                {$set: {pennies: comment.pennies + 1}}
            )
        } catch (err) {
            User.updateOne(
                {_id: userId},
                {
                    $pull: {likedComments: commentId},
                    $set: {pennies: user.pennies +1 }
                }
            )
            console.log(err)
            return res.status(500).send(err)
        }

        return res.status(200).json(comment)

    } catch (err) {
        return res.status(500).send(err)
    }
}

// TODO: Delete Comment (how will it work with pennies?)