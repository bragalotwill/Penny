import { protect } from "../middleware/auth.js"
import express from "express"
import { getPost, makePost, likePost } from "../controllers/postController.js"


const postRoutes = express.Router()

// api/posts
postRoutes.get("/", getPost)
postRoutes.post("/create", protect, makePost)
postRoutes.post("/like", protect, likePost) // TODO: cannot unlike post for now (could cause money issue?)

export default postRoutes
