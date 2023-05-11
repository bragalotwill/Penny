import Comment from "../models/commentModel.js"
import User from "../models/userModel.js"
import Post from "../models/postModel.js"
import { Request, Response } from "express"
import { validateId, validateImage, validateText } from "./request.js"

/*
@desc   Gets comment data
@route  GET /api/comments
@access PUBLIC
*/
export const getComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.body
        if (!id || !validateId(id)) {
            return res.status(400).send("Invalid comment id.")
        }

        const comment = await Comment.findById(id)
        if (!comment) {
            return res.status(400).send("Comment not found.")
        }

        return res.status(200).json(comment)

    } catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

//TODO: Test
/*
@desc   Makes a new comment
@route  POST /api/comments/create
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

        if (image && !validateImage(image)) {
            return res.status(400).send("Invalid image.")
        }

        if (text && !validateText(text)) {
            return res.status(400).send("Invalid text.")
        }

        if (user.pennies < 1) {
            return res.status(400).send("User does not have enough pennies to make comment.")
        }

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(400).send("Post could not be found.")
        }

        let parentComment = null
        if (parentCommentId && parentCommentId !== "") {
            parentComment = await Comment.findById(parentCommentId)
            if (!parentComment) {
                return res.status(400).send("Parent comment could not be found.")
            }
        }

        const comment = new Comment ({
            creator: user._id,
            image: image ? image : "",
            text: text ? text : "",
            parentComment: parentCommentId,
            post: postId
        })

        if (!comment) {
            return res.status(500).send("Comment could not be created.")
        }

        const savedComment = await comment.save()

        try {
            await User.findByIdAndUpdate(
                user.id,
                {
                    $push: {comments: savedComment._id},
                    $set: {pennies: user.pennies - 1}
                }
            )
        } catch (err) {
            await Comment.findByIdAndDelete(savedComment.id)
            console.log(err)
            return res.status(500).send(err)
        }

        try {
            await Post.findByIdAndUpdate(
                postId,
                {$push: {comments: savedComment._id}}
            )
        } catch (err) {
            await Comment.findByIdAndDelete(savedComment.id)
            await User.findByIdAndUpdate(
                user.id,
                {
                    $pull: {comments: savedComment._id},
                    $set: {pennies: user.pennies}
                }
            )
            console.log(err)
            return res.status(500).send(err)
        }

        if (parentComment) {
            try {
                await Comment.findByIdAndUpdate(
                    parentCommentId,
                    {$push: {subComments: savedComment._id}}
                )
            } catch (err) {
                await Comment.findByIdAndDelete(savedComment.id)
                await User.findByIdAndUpdate(
                    user.id,
                    {
                        $pull: {comments: savedComment._id},
                        $set: {pennies: user.pennies}
                    }
                )
                await Post.findByIdAndUpdate(
                    postId,
                    {$pull: {comments: savedComment._id}}
                )
                return res.status(500).send(err)
            }
        }

        return res.status(201).json(savedComment)

    } catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

//TODO: Test
/*
@desc   Likes comment
@route  POST /api/comments/like
@access PRIVATE
*/
export const likeComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.body
        const user = req.user

        if (!id || !validateId(id)) {
            return res.status(400).send("Invalid comment id.")
        }

        const comment = await Comment.findById(id)
        if (!comment) {
            return res.status(400).send("Comment not found.")
        }

        if (user._id.equals(comment.creator)) {
            return res.status(400).send("Creator cannot like own comment.")
        }

        if (user.pennies < 1) {
            return res.status(400).send("User does not have enough pennies to like comment.")
        }

        if (comment.whoLiked.includes(user._id)) {
            return res.status(400).send("User has already liked comment.")
        }


        await User.findByIdAndUpdate(
            user.id,
            {
                $push: {likedComments: comment._id},
                $set: {pennies: user.pennies - 1}
            }
        )

        let updatedComment
        try {
            updatedComment = await Comment.findByIdAndUpdate(
                id,
                {
                    $set: {pennies: comment.pennies + 1},
                    $push: {whoLiked: user._id}
                },
                {new: true}
            )
        } catch (err) {
            await User.findByIdAndUpdate(
                user.id,
                {
                    $pull: {likedComments: comment._id},
                    $set: {pennies: user.pennies}
                }
            )
            console.log(err)
            return res.status(500).send(err)
        }

        try {
            const creator = await User.findById(comment.creator)
            await User.findByIdAndUpdate(
                creator.id,
                {$set: {pennies: creator.pennies + 1}}
            )
        } catch (err) {
            await Comment.findByIdAndUpdate(
                id,
                {
                    $set: {pennies: comment.pennies},
                    $pull: {whoLiked: user._id}
                }
            )
            await User.findByIdAndUpdate(
                user.id,
                {
                    $pull: {likedComments: comment._id},
                    $set: {pennies: user.pennies}
                }
            )
            console.log(err)
            return res.status(500).send(err)
        }

        return res.status(200).json(comment)

    } catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

// TODO: Delete Comment (how will it work with pennies?)