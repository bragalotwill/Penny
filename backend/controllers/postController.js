import Post from "../models/postModel.js"
import User from "../models/userModel.js"

/*
@desc   Gets post data
@route  GET /api/posts
@access <REVIEW>
*/
export const getPost = async (req, res) => {
    try {
        const { _id } = req.body
        if (!_id) {
            return res.status(400).send("Missing post id.")
        }

        const post = await Post.findOne({_id})
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
@access <REVIEW>
*/
export const makePost = async (req, res) => {
    try {
        const {
            creator_id,
            image,
            text
        } = req.body

        if (!creator) {
            return res.status(400).send("No user creator specified.")
        }
        if (!image && !text) {
            return res.status(400).send("Post must have image or text.")
        }

        const user = await User.findOne({_id: creator_id})
        if (!user) {
            return res.status(400).send("Creator user not found.")
        }

        const post = new Post({
            creator_id,
            image: image ? image:"",
            text: text ? text:""
        })

        if (!post) {
            return res.status(400).send("Invalid user data.")
        }

        const savedPost = await post.save()

        //add post id to user's posts
        try {
            User.updateOne(
                {_id: creator_id},
                {$push: {posts: savedPost._id}}
            )
        } catch (err) {
            Post.deleteOne({_id: savedPost._id})
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
@access <REVIEW>
*/
export const likePost = async (req, res) => {
    try {
        const {
            user_id,
            post_id
        } = req.body

        if (!username || !post_id) {
            return res.status(400).send("Missing username or post id.")
        }

        const post = await Post.findOne({_id: post_id})
        if (!post) {
            return res.status(400).send("Post not found.")
        }

        const user = await User.findOne({_id: user_id})
        if (!user) {
            return res.status(400).send("User not found.")
        }

        if (user.pennies < 1) {
            return res.status(400).send("User does not have enough pennies to like post")
        }

        Post.updateOne(
            {_id: post_id},
            {
                $push: {whoLiked: user_id},
                $set: {pennies: post.pennies + 1}
            }
        )

        User.updateOne(
            {_id: user_id},
            {
                $push: {likedPosts: user_id},
                $set: {pennies: user.pennies - 1}
            }
        )

        return res.status(201).json(post)

    } catch(err) {
        console.log(err)
        return res.status(500).send(err)
    }
}