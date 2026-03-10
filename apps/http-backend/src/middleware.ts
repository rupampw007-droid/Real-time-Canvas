import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "@repo/backend-common/config";

export const middleware = (req: Request, res: Response, next: NextFunction ) => {
    const token = req.headers["authorization"] ?? "";
    const decoded = jwt.verify(token, JWT_SECRET)
    if(decoded) {
        //@ts-ignore
        req.userId = decoded.userId
        next();
    }
    return res.json({
        message: 'Unauthorized'
    })
}