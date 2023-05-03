import express from 'express'
import { registerUser, loginUser, getUser } from '../controllers/userController.js'
const router = express.Router()

//api/users
router.get('/', getUser)
router.post('/login', loginUser)
router.post('/register', registerUser)

export default router