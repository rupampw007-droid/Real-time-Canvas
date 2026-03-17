import WebSocket, { WebSocketServer } from 'ws';
import jwt, { JwtPayload } from 'jsonwebtoken'
import { JWT_SECRET } from "@repo/backend-common/config";
import {prismaClient} from "@repo/db"

interface User {
  ws : WebSocket,
  rooms: string[],
  userId : string
}

const users : User[] = []
const rooms = []


const wss = new WebSocketServer({ port: 8080 });

function checkUser(token : string) : string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    if(!decoded.userId) {
        return null;
    }
    return decoded.userId
  }
  catch(e: any) {
    console.log(e.message)
    return null
  }
}

wss.on('connection', function connection(ws, request) {
  ws.on('error', console.error);

  const url = request.url;
  if(!url) {
    return;
  }

  const queryParams = new URLSearchParams(url.split('?')[1])
  const token = queryParams.get('token') || ""

  const userId = checkUser(token);
  if(!userId) {
    ws.close()
    return null
  }

  users.push({
    userId,
    rooms: [],
    ws
  })


  ws.on('message', async function message(data) {
    let parseDdata;
    if(typeof data !== "string") {
      parseDdata = JSON.parse(data.toString());
    } else {
      parseDdata = JSON.parse(data);
    }

    if(parseDdata.type === "join_room") {
      const user = users.find(x => x.ws === ws);
      user?.rooms.push(parseDdata.roomId);
    }

    if(parseDdata.type === "leave_room") {
      const user = users.find(x => x.ws === ws);
      if(!user) {
        return;
      }
      user.rooms = user?.rooms.filter(x => x !== parseDdata.room);
    }

    console.log("message recieved")
    console.log(parseDdata)

    if(parseDdata.type === "chat") {
      const roomId = parseDdata.roomId;
      const message = parseDdata.message;

      await prismaClient.chat.create({
        data: {
          roomId: Number(roomId),
          message,
          userId
        }
      })

      users.forEach(user => {
        if(user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: "chat",
            message,
            roomId
          }))
        }
      })
    }
  });
});