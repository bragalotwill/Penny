import express from 'express'
// import { getComment, makeComment, likeComment } from '../controllers/commentController.js'


const commentRoutes = express.Router()

// api/comments
// commentRoutes.get('/', getComment)
// commentRoutes.post('/create', makeComment)
// commentRoutes.post('/like', likeComment) // cannot unlike comment for now (could cause money issue?)

export default commentRoutes