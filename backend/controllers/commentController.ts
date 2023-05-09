import Comment from "../models/commentModel.js"
import User from "../models/userModel.js"
import Post from "../models/postModel.js"
import { Request, Response } from "express"
import { validateId, validateImage, validateText } from "./request.js"

// TODOL Test functions
/*
@desc   Gets comment data
@route  GET /api/comments
@access PUBLIC
*/
export const getComment = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body
        if (!_id || !validateId(_id)) {
            return res.status(400).send("Invalid comment id.")
        }

        const comment = await Comment.findById(_id)
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
@access PRIVATE
*/
export const makeComment = async (req: Request, res: Response) => {
    try {
        const {
            postId,
            parentCommentId,
            image,
            text
        } = req.body

        const user = req.user

        if (!postId || !validateId(postId)) {
            return res.status(400).send("Invalid post id.")
        }

        if (parentCommentId && !validateId(parentCommentId)) {
            return res.status(400).send("Invalid parent comment id.")
        }

        if (!image && !text) {
            return res.status(400).send("Comment must have text or image.")
        }

        if (!image || !validateImage(image)) {
            // TODO: Complete image validation
            return res.status(400).send("Invalid image.")
        }

        if (!text || !validateText(text)) {
            // TODO: Add more text support
            return res.status(400).send("Invalid text.")
        }

        if (user.pennies < 1) {
            return res.status(400).send("User does not have enough pennies to make comment.")
        }

        const post = await Post.findById({postId})
        if (!post) {
            return res.status(400).send("Post could not be found.")
        }

        let parentComment = null
        if (parentCommentId && parentCommentId !== "") {
            parentComment = await Post.findById(parentCommentId)
            if (!parentComment) {
                return res.status(400).send("Parent comment could not be found.")
            }
        }

        const comment = new Comment ({
            creator: user._id,
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
            User.findByIdAndUpdate(
                user._id,
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
            Post.findByIdAndUpdate(
                postId,
                {$push: {comments: savedComment._id}}
            )
        } catch (err) {
            Comment.deleteOne({_id: savedComment._id})
            User.findByIdAndUpdate(
                user._id,
                {
                    $pull: {comments: savedComment._id},
                    $set: {pennies: user.pennies + 1}
                }
            )
            console.log(err)
            return res.status(500).send(err)
        }

        try {
            Comment.findByIdAndUpdate(
                parentCommentId,
                {$push: {subComments: savedComment._id}}
            )
        } catch (err) {
            Comment.deleteOne({_id: savedComment._id})
            User.findByIdAndUpdate(
                user._id,
                {
                    $pull: {comments: savedComment._id},
                    $set: {pennies: user.pennies + 1}
                }
            )
            Post.findByIdAndUpdate(
                postId,
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
        const { _id } = req.body
        const user = req.user

        if (!_id || !validateId(_id)) {
            return res.status(400).send("Invalid comment id.")
        }

        const comment = await Comment.findById({_id})
        if (!comment) {
            return res.status(400).send("Comment not found.")
        }

        if (user.pennies < 1) {
            return res.status(400).send("User does not have enough pennies to like comment.")
        }

        User.findByIdAndUpdate(
            user._id,
            {
                $push: {likedComments: _id},
                $set: {pennies: user.pennies - 1}
            }
        )

        try {
            Comment.findByIdAndUpdate(
                _id,
                {$set: {pennies: comment.pennies + 1}}
            )
        } catch (err) {
            User.findByIdAndUpdate(
                user._id,
                {
                    $pull: {likedComments: _id},
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