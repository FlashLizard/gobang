import { Server } from "socket.io"
import { createServer } from "http"
import express from "express"
import settings from "@root/settings.json"
import Logger from "@root/tools/Logger"

let logger = Logger.createLogger("server.log");
let app = express();
let http = createServer(app);
let io = new Server(http);

io.on('connect', (socket) => {
    logger.info(`a user connected`);
})

http.listen(settings.serverPort)
logger.info(`server is listening ${settings.serverPort} port`);
