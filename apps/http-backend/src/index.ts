import "dotenv/config";
import { prismaClient } from "@repo/db";
import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware.js";
import {
  CreateRoomSchema,
  CreateSigninSchema,
  CreateUserSchema,
} from "@repo/common/types";

const app = express();
app.use(express.json())


app.listen(3001, () => console.log("App is listening to the port 3000"));

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.json({
      message: "Incorrect Input",
    });
  }
  console.log(parsedData.data)
  try {
  await prismaClient.user.create({
    data: {
      email: parsedData.data.email,
      name: parsedData.data.username,
      password: parsedData.data.password,
    },
  });

  return res.status(200).json({
    data : parsedData.data
  });
} catch(e: any) {
  console.log(e)
  return res.status(400).json({
    error: e.message
  })
}
});

// app.post("/signin", (req, res) => {
//   const data = CreateSigninSchema.safeParse(req.body);
//   if (!data.success) {
//     return res.json({
//       message: "Incorrect Input",
//     });
//   }

//   const token = jwt.sign(username, JWT_SECRET);

//   return res.json({
//     message: token,
//   });
// });

app.post("/room", middleware, (req, res) => {
  const data = CreateRoomSchema.safeParse(req.body);
  if (!data.success) {
    return res.json({
      message: "Incorrect Input",
    });
  }
});
