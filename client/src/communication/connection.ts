import { io } from "socket.io-client";

// Notion: the "transports" option is used to prevent "Access-Control-Allow-Origin" error.
export const socket = io("http://localhost:23456/", {
    transports: ['websocket', 'polling', 'flashsocket']
});