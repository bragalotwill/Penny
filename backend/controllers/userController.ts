import User from "../models/userModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Request, Response } from "express"
import { validateEmail, validateInteger, validatePassword, validateString, validateUsername } from "./request.js"
import { Types } from "mongoose"

// TODO: Add phone number/email verification

/*
@desc   Registers a new user
@route  POST /api/users/register
@access PUBLIC
*/
export const registerUser = async (req: Request, res: Response) => {
    try {
        const {
            username,
            displayName,
            email,
            password,
            pfp
        } = req.body

        if (!username || !validateUsername(username)) {
            return res.status(400).send("Invalid username")
        }

        if (!displayName || !validateUsername(displayName)) {
            return res.status(400).send("Invalid display name.")
        }

        if (!email || !validateEmail(email)) {
            return res.status(400).send("Invalid email.")
        }

        if (!password || !validatePassword(password)) {
            return res.status(400).send("Invalid password.")
        }

        // TODO: validate string is a path
        if (!validateString(pfp)) {
            return res.status(400).send("Invalid profile picture link.")
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
            displayName,
            email,
            password: hashedPassword,
            pfp: pfp ? pfp : ""
        })

        if (!user) {
            return res.status(400).send("Invalid user data.")
        }

        const savedUser = await user.save()
        return res.status(201).json({
            _id: savedUser._id,
            username: savedUser.username,
            displayName: savedUser.displayName,
            email: savedUser.email,
            pfp: savedUser.pfp,
            token: generateToken(savedUser._id)
        })

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
export const loginUser = async (req: Request, res: Response) => {
    try {
        const {
            username,
            password
        } = req.body

        if (!username || !validateUsername(username)) {
            return res.status(400).send("Invalid username.")
        }

        if (!password || !validatePassword(password)) {
            return res.status(400).send("Invalid password.")
        }

        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).send("User not found.")
        }

        const hash = user.password
        const valid = await bcrypt.compare(password, hash)
        if (!valid) {
            return res.status(400).send("Incorrect password.")
        }

        return res.status(200).json({
            _id: user._id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            pfp: user.pfp,
            pennies: user.pennies,
            friends: user.friends,
            token: generateToken(user._id)
        })

    } catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

/*
@desc   Adds pennies to user account
@route  POST /api/users
@access PRIVATE
*/
export const addPennies = async (req: Request, res: Response) => {
    try {
        const { pennies } = req.body
        let user = req.user

        // TODO: Double check max number of pennies
        if (!pennies || !validateInteger(pennies, 1, 1000000)) {
            return res.status(400).send("Invalid number of pennies.")
        }

        User.findByIdAndUpdate({_id: user._id}, {$set: {pennies}})
        user = await User.findById({_id: user._id})
        return res.status(200).json(user)

    } catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

const generateToken = (_id: Types.ObjectId) => {
    return jwt.sign(_id, process.env.TOKEN_SECRET, {expiresIn: "1d"})
}

// TODO: Get user separate into different gets (public profile view/logged in view/self view)
// TODO: Delete user (how will it work with pennies?)