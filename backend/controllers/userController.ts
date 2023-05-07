import User from "../models/userModel.js"
import bcrypt from "bcrypt"
import { Request, Response } from "express"
import { validateEmail, validateInteger, validatePassword, validateString, validateUsername } from "./request.js"

/*
@desc   Registers a new user
@route  POST /api/users/register
@access PUBLIC
*/
export const registerUser = async (req: Request, res: Response) => {
    try {
        const {
            username,
            email,
            password,
            pfp
        } = req.body

        if (!username || !validateUsername(username)) {
            return res.status(400).send("Invalid username")
        }

        if (!email || !validateEmail(email)) {
            return res.status(400).send("Invalid email.")
        }

        if (!password || !validatePassword(password)) {
            return res.status(400).send("Invalid password.")
        }

        //TODO: validate string is a path
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
            email,
            password: hashedPassword,
            pfp: pfp ? pfp : ""
        })

        if (!user) {
            return res.status(400).send("Invalid user data.")
        }

        const savedUser = await user.save()
        return res.status(201).json(savedUser)

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

        return res.status(200).json(user)

    } catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

/*
@desc   Gets user data
@route  GET /api/users
TODO: @access <REVIEW>
*/
//TODO: Create private API access with token
export const getUser = async (req: Request, res: Response) => {
    try {
        const { _id } = req.body

        if (!_id || !validateString(_id)) {
            return res.status(400).send("Invalid user id.")
        }

        const user = await User.findOne({_id})
        if (!user) {
            return res.status(400).send("User not found.")
        }

        return res.status(200).json(user)

    } catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

/*
@desc   Adds pennies to user account
@route  POST /api/users
TODO: @access <REVIEW>
*/
export const addPennies = async (req: Request, res: Response) => {
    try {
        const { _id,
                pennies
        } = req.body

        if (!_id || !validateString(_id)) {
            return res.status(400).send("Invalid user id.")
        }

        //TODO: Double check max number of pennies
        if (!pennies || !validateInteger(pennies, 1, 1000000)) {
            return res.status(400).send("Invalid number of pennies.")
        }

        let user = await User.findOne({_id})
        if (!user) {
            return res.status(400).send("User not found.")
        }

        User.updateOne({_id}, {$set: {pennies}})
        user = await User.findOne({_id})

        return res.status(200).json(user)

    } catch (err) {
        console.log(err)
        return res.status(500).send(err)
    }
}


//TODO: Delete user (how will it work with pennies?)