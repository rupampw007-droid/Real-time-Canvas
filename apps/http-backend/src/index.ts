import express from "express";
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware.js";
import { CreateRoomSchema, CreateSigninSchema, CreateUserSchema } from "@repo/common/types";
const app = express();

app.listen(3001, () => console.log("App is listening to the port 3000"))

app.post('/signup' , (req,res) => {
    const data = CreateUserSchema.safeParse(req.body)
    if(!data.success) {
        return res.json({
            message: "Incorrect Input"
        })
    }
    res.json({
        userId : 123
    })
})

app.post('/signin' , (req,res) => {
     const data = CreateSigninSchema.safeParse(req.body)
    if(!data.success) {
        return res.json({
            message: "Incorrect Input"
        })
    }

    const token = jwt.sign(username, JWT_SECRET);

    return res.json({
        message: token
    })
})

app.post('/room' , middleware, (req,res) => {
     const data = CreateRoomSchema.safeParse(req.body)
    if(!data.success) {
        return res.json({
            message: "Incorrect Input"
        })
    }
})