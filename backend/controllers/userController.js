import User from "../models/userModel.js";
import bcrypt from "bcrypt"

/*
@desc   Registers a new user
@route  POST /api/users/register
@access PUBLIC
*/
export const registerUser = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            pfp
        } = req.body

        if (!username || !email || !password) {
            return res.status(400).send("Missing required fields to register user.")
        }

        const emailExists = await User.findOne({email})
        if (emailExists) {
            return res.status(400).send("Email already associated with an account.")
        }

        const userExists = await User.findOne({username})
        if (userExists) {
            return res.status(400).send("Username is already taken.")
        }

        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = new User({
            username,
            email,
            password: hashedPassword,
            pfp: pfp ? pfp : ""
        })

        if (user) {
            const savedUser = await user.save()
            return res.status(201).json(savedUser)
        }

        return res.status(400).send("Invalid user data.")
        

    } catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }   
}

/*
@desc   Allows user to login
@route  POST /api/users/login
@access PUBLIC
*/
export const loginUser = async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body

        if (!username || !password) {
            return res.status(400).send("Missing required fields to login")
        }

        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).send("User not found")
        }

        const hash = user.password
        const valid = await bcrypt.compare(password, hash)
        if (!valid) {
            return res.status(400).send("Incorrect password")
        }

        return res.status(200).json(user)

    } catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

/*
@desc   Gets user data
@route  GET /api/users
@access PUBLIC
*/
export const getUser = async (req, res) => {
    try {
        const { username } = req.body

        if (!username) {
            return res.status(400).send("Missing required fields to get user")
        }

        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).send("User not found")
        }

        return res.status(200).json(user)

    } catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
}
