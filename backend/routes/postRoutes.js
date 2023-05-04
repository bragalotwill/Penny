import express from 'express'
import { getPost, makePost, likePost } from '../controllers/postController.js'


const postRoutes = express.Router()

//api/posts
postRoutes.get('/', getPost)
postRoutes.post('/create', makePost)
postRoutes.post('/like', likePost) //cannot unlike post for now (could cause money issue?)

export default postRoutes
