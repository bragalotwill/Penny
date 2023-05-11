import User from "../models/userModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { Request, Response } from "express"
import { validateDisplayName, validateEmail, validateId, validateInteger, validatePassword, validateProfilePicture, validateString, validateText, validateUsername } from "./request.js"
import { Types } from "mongoose"


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
            return res.status(400).send("Username is not valid.")
        }

        if (!displayName || !validateDisplayName(displayName)) {
            return res.status(400).send("Display name is not valid.")
        }

        if (!email || !validateEmail(email)) {
            return res.status(400).send("Email is not valid.")
        }

        if (!password || !validatePassword(password)) {
            return res.status(400).send("Password is not valid.")
        }

        if (pfp && !validateProfilePicture(pfp)) {
            return res.status(400).send("Profile picture is not valid.")
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
            return res.status(500).send("User could not be created")
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

    } catch(err) {
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
            return res.status(400).send("Username is not valid.")
        }

        if (!password || !validatePassword(password)) {
            return res.status(400).send("Password is not valid.")
        }

        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).send("No user with that username.")
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
    } catch(err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

// TODO: Add banking
/*
@desc   Adds pennies to user account
@route  POST /api/users/buy
@access PRIVATE
*/
export const buyPennies = async (req: Request, res: Response) => {
    try {
        const { penniesToAdd } = req.body
        const user = req.user

        // TODO: Double check max number of pennies
        if (!penniesToAdd || !validateString(penniesToAdd, null, null, /^[0-9]+$/)) {
            return res.status(400).send("Invalid number of pennies")
        }
        const pennies = parseInt(penniesToAdd, 10)

        if (!validateInteger(pennies, 1, 1000000)) {
            return res.status(400).send("Invalid number of pennies.")
        }

        const updatedUser = await User.findByIdAndUpdate(
            user.id,
            {$set: {pennies: (user.pennies + pennies)}},
            {new: true}
        )

        return res.status(200).json(updatedUser)
    } catch(err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

// TODO: Add banking
// TODO: Test function
/*
@desc   Removes pennies to user account
@route  POST /api/users/withdraw
@access PRIVATE
*/
export const withdrawPennies = async (req: Request, res: Response) => {
    try {
        const { penniesToRemove } = req.body
        const user = req.user

        // TODO: Double check max number of pennies
        if (!penniesToRemove || !validateString(penniesToRemove, null, null, /^[0-9]+$/)) {
            return res.status(400).send("Invalid number of pennies")
        }
        const pennies = parseInt(penniesToRemove, 10)

        if (!validateInteger(pennies, 1, 1000000)) {
            return res.status(400).send("Invalid number of pennies.")
        }

        if (user.pennies < pennies) {
            return res.status(400).send("User does not have enough pennies.")
        }

        const updatedUser = await User.findByIdAndUpdate(
            user.id,
            {$set: {pennies: (user.pennies - pennies)}},
            {new: true}
        )

        return res.status(200).json(updatedUser)
    } catch(err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

// TODO: Test function
/*
@desc   Searches for a user
@route  GET /api/users/search
@access PRIVATE
*/
export const searchUser = async (req: Request, res: Response) => {
    try {
        const { search } = req.body
        const user = req.user
        if (!search || !validateText(search)) {
            return res.status(400).send("Invalid search.")
        }

        // TODO: paging
        const users = await User.aggregate([
            {$match: {$and: [
                {$text: {$search: search}},
                {_id: {$ne: user._id}}
            ]}},
            {$set: {
                numFriends: {$size: {$ifNull: ["$friends", []]}},
                isFriend: {$cond: [{$gt: [{$size: {
                    $setIntersection: [["$_id"], user.friends]
                }}, 0]}, true, false]}
            }},
            {$sort: {
                isFriend: -1,
                score: {$meta: "textScore"},
                numFriends: -1
            }},
            {$project: {
                _id: 1, 
                username: 1, 
                displayName: 1, 
                numFriends: 1, 
                isFriend: 1, 
                score: {$meta: "textScore"}
            }},
            {$limit: 20}
        ])

        if (!users) {
            return res.status(200).json({})
        }
        return res.status(200).json(users)

    } catch(err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

/*
@desc   Gets user's data
@route  GET /api/users
@access PRIVATE
*/
export const getMe = async (req: Request, res: Response) => {
    try {
        const user = req.user
        return res.status(200).json(user)
    } catch(err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

// TODO: Test function
/*
@desc   Adds friend to friends list
@route  POST /api/users/friend
@access PRIVATE
*/
export const addFriend = async (req: Request, res: Response) => {
    try {
        const { id } = req.body
        const user = req.user

        if (!id || !validateId(id)) {
            return res.status(400).send("Invalid friend id.")
        }

        const friend = await User.findById(id)
        if (!friend) {
            return res.status(400).send("Could not find user friend.")
        }

        const updatedUser = await User.findByIdAndUpdate(
            user.id,
            {$push: {friends: friend._id}},
            {new: true}
        )

        return res.status(201).json(updatedUser)

    } catch(err) {
        console.log(err)
        return res.status(500).send(err)
    }
}

const generateToken = (_id: Types.ObjectId) => {
    return jwt.sign({_id}, process.env.TOKEN_SECRET, {expiresIn: "1d"})
}

// TODO: Get user separate into different gets (public profile view/logged in view/self view)
// TODO: Delete user (how will it work with pennies?)