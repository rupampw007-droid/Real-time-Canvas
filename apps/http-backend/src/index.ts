import "dotenv/config";
import { prismaClient } from "@repo/db";
import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware.js";
import {
  CreateRoomSchema,
  CreateUserSchema,
  SigninSchema,
} from "@repo/common/types";
import { AuthRequest } from "./types/types.js";

const app = express();
app.use(express.json());

app.listen(3001, () => console.log("App is listening to the port 3000"));

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(parsedData.error);
    return res.json({
      message: "Incorrect Input",
    });
  }
  //TODO: HASH THE PASSWORD
  try {
    await prismaClient.user.create({
      data: {
        email: parsedData.data.email,
        name: parsedData.data.username,
        password: parsedData.data.password,
      },
    });

    return res.status(200).json({
      data: parsedData.data,
    });
  } catch (e: any) {
    console.log(e);
    return res.status(400).json({
      error: e.message,
    });
  }
});

app.post("/signin", async (req, res) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(parsedData.error);
    return res.status(400).json({
      message: "Invalid Input",
    });
  }
  //TODO verify Hashed password
  try {
    const User = await prismaClient.user.findFirst({
      where: {
        email: parsedData.data.email,
        password: parsedData.data.password,
      },
    });
    if (!User) {
      return res.status(403).json({
        message: "Invalid email/password",
      });
    }
    const token = jwt.sign(
      {
        userId: User?.id,
      },
      JWT_SECRET,
    );

    return res.status(200).json({
      token,
    });
  } catch (e: any) {
    return res.json({
      message: e.message,
    });
  }
});

app.post("/room", middleware, async (req: AuthRequest, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.json({
      message: "Incorrect Input",
    });
  }
  const userId = req.userId;
  if (!userId) {
    return res.status(403).json({
      message: "User is not authorized",
    });
  }
try {
  await prismaClient.room.create({
    data: {
      slug: parsedData.data.slug,
      adminId: userId,
    },
  });
} catch(e) {
  res.json({
    message: "Room already exists"
  })
}
});
