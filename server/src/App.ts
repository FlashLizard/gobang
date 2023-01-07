import { Server, Socket } from "socket.io"
import { createServer } from "http"
import express from "express"
import { serverPort } from "@communication/settings"
import { logger } from "./tools/ServerLogger"
import Player from "./Player"
import { LoginInfo, ResponseInfo } from "@communication/parameters"

let app = express();
let http = createServer(app);
let io = new Server(http);
let users: Map<string, Player> = new Map(); //name->player
let sockets: Map<string, string | null | undefined> = new Map(); //socketid->name

function disconnectPlayer(player: string | Player | null | undefined) {
    if (typeof player == 'string') {
        player = users.get(player);
    }
    player?.disconnect();
    if (player) {
        users.delete(player.name);
    }
}

export function bindLoginListener(socket: Socket) {
    socket.on("login", (user: LoginInfo) => {
        let name = user.name;
        if (users.get(name)) {
            socket.emit('response-login', { code: false, desc: 'Already Inline' } as ResponseInfo);
        }
        else {
            let preName = sockets.get(socket.id);
            disconnectPlayer(preName);
            sockets.set(socket.id, name);
            let player: Player | undefined = new Player(name, socket);
            users.set(name, player);
            player.connect();
            socket.on('disconnect', () => {
                disconnectPlayer(player);
            })
            socket.on("login-out", () => {
                let name = sockets.get(socket.id);
                disconnectPlayer(name);
                sockets.set(socket.id, null);
                socket.emit('response-login', { code: true, desc: 'Success Login Out' });
            })
            socket.emit('response-login', { code: true, desc: 'Login Success', others: name } as ResponseInfo);
            logger.info(`user ${user.name} logined from id ${socket.id}`);
        }
    })
}

io.on('connection', (socket) => {
    logger.info(`socket id ${socket.id} connected`);
    bindLoginListener(socket);
});

http.listen(serverPort);
logger.info(`server is listening ${serverPort} port`);

