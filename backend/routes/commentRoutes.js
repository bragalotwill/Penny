import express from 'express'
import { getComment, makeComment, likeComment } from '.../controllers/commentController.js'
const router = express.Router()

//api/comments
router.get('/', getComment)
router.post('/create', makeComment)
router.post('/like', likeComment) //cannot unlike comment for now (could cause money issue?)

