import { Server, Socket } from "socket.io"
import { createServer } from "http"
import express from "express"
import settings from "@communication/settings.json"
import roomManager from "./RoomManager"
import { logger } from "./ServerLogger"
import { Player } from "./Player"
import { LoginInfo } from "@communication/parameters"

let app = express();
let http = createServer(app);
let io = new Server(http);
let users: { [index: string]: Player } = {}

io.on('connection', (socket) => {
    logger.info(`socket id ${socket.id} connected`);
    socket.on("login", (user: LoginInfo) => {
        logger.info(user);
        if (!users[user.name]) {
            users[user.name] = new Player(user.name, io.sockets.sockets.get(user.socketId) as Socket);
            logger.info(`user ${user.name} logined from id ${user.socketId}`);
        }
        else {
            users[user.name].freshSocket(io.sockets.sockets.get(user.socketId) as Socket);
            logger.info(`user ${user.name} relogined from id ${user.socketId}`);
        }
    })
});

http.listen(settings.serverPort);
logger.info(`server is listening ${settings.serverPort} port`);

