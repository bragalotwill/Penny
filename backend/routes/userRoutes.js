import express from 'express'
import { registerUser, loginUser, getUser } from '../controllers/userController.js'


const userRoutes = express.Router()

//api/users
userRoutes.get('/', getUser)
userRoutes.post('/login', loginUser)
userRoutes.post('/register', registerUser)

export default userRoutes