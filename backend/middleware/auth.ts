import jwt from "jsonwebtoken"
import User from "../models/userModel.js"
import { NextFunction, Request, Response } from "express"

export const protect = async(req: Request, res: Response, next: NextFunction) => {
    try {
        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith("Bearer")
        ) {
            return res.status(400).send("Token not included.")
        }

        const arr = req.headers.authorization.split(" ")
        if (arr.length < 2) {
            return res.status(400).send("Token not included.")
        }

        const token = req.headers.authorization.split(" ")[1]

        try {
            const decodedId = jwt.verify(token, process.env.TOKEN_SECRET)
            // pass all user data except password
            const user = await User.findById(decodedId).select("-password")
            if (!user) {
                return res.status(400).send("User not found.")
            }

            req.user = user
            next()
        } catch (err) {
            return res.status(400).send("Invalid token.")
        }
    } catch(err) {
        console.log(err)
        return res.status(500).send(err)
    }
}
