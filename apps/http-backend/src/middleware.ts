import { Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "@repo/backend-common/config";
import { AuthRequest } from "./types/types.js";


export const middleware = (req: AuthRequest, res: Response, next: NextFunction ) => {
    const token = req.headers["authorization"] ?? "";
    const decoded = jwt.verify(token, JWT_SECRET) as {userId : string}
    if(decoded) {
        req.userId = decoded.userId
        next();
    }
    return res.json({
        message: 'Unauthorized'
    })
}