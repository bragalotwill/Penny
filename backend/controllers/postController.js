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
            creator,
            image,
            text
        } = req.body

        if (!creator) {
            return res.status(400).send("No user creator specified.")
        }
        if (!image && !text) {
            return res.status(400).send("Post must have image or text.")
        }

        const user = await User.findOne({username: creator})
        if (!user) {
            return res.status(400).send("Creator user not found.")
        }

        const post = new Post({
            creator,
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
                {username: creator},
                {$push: {posts: savedPost._id}})
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
export const likePost = (req, res) => {
    try {
        //TODO
    } catch(err) {
        console.log(err)
        return res.status(500).send(err)
    }
}