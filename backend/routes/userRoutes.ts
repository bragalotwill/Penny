import express from "express"
import { registerUser, loginUser, buyPennies, withdrawPennies, getMe, addFriend, searchUser } from "../controllers/userController.js"
import { protect } from "../middleware/auth.js"


const userRoutes = express.Router()

// api/users
userRoutes.get("/", protect, getMe)
userRoutes.post("/login", loginUser)
userRoutes.post("/register", registerUser)
userRoutes.post("/buy", protect, buyPennies)
userRoutes.post("/withdraw", protect, withdrawPennies)
userRoutes.post("/friend", protect, addFriend)
userRoutes.get("/search", protect, searchUser)

export default userRoutes