import {io} from "socket.io-client";
import settings from "./settings.json"

const socket = io(settings.serverURL, {
    transports: ['websocket', 'polling', 'flashsocket']
});

export default socket;