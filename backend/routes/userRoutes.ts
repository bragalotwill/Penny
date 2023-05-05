import express from 'express'
import { registerUser, loginUser, getUser, addPennies } from '../controllers/userController.js'


const userRoutes = express.Router()

// api/users
userRoutes.get('/', getUser)
userRoutes.post('/login', loginUser)
userRoutes.post('/register', registerUser)
userRoutes.post('/pennies', addPennies)

export default userRoutes