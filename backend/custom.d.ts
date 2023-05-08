import { Document } from "mongoose"
import User from "./models/userModel.js"
import { IUser } from "./models/userModel.js"

declare global {
    namespace Express {
        export interface Request {
            user?: IUser
        }
    }
}