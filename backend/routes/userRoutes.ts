import express from "express"
import { registerUser, loginUser, addPennies, getMe } from "../controllers/userController.js"
import { protect } from "../middleware/auth.js"


const userRoutes = express.Router()

// api/users
userRoutes.get("/", protect, getMe)
userRoutes.post("/login", loginUser)
userRoutes.post("/register", registerUser)
userRoutes.post("/pennies", protect, addPennies)

export default userRoutes