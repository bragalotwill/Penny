import express from 'express'
import { getPost, makePost, likePost } from '.../controllers/postController.js'
const router = express.Router()

//api/posts
router.get('/', getPost)
router.post('/create', makePost)
router.post('/like', likePost) //cannot unlike post for now (could cause money issue?)

