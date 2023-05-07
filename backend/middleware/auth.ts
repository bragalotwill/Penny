import jwt from "jsonwebtoken"
import User from "../models/userModel.js"
import { NextFunction, Request, Response } from "express"

export const protect = async(req: Request, res: Response, next: NextFunction) => {
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

    try {
        const token = req.headers.authorization.split(" ")[1]
        const decodedId = jwt.verify(token, process.env.TOKEN_SECRET)
        // pass all user data except password
        const user = await User.findById(decodedId).select("-password")
        req.user = user
        next()
    } catch (err) {
        return res.status(400).send("Authorization failed.")
    }

}
