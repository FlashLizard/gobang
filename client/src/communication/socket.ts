import { io } from "socket.io-client";
import { boardSize, serverURL } from "./settings"
import { emit } from "process";
import { nowName } from "../components/login/Login";
import boardcast from "../tools/broadcast";

let components: ({ component: any, listeners: { event: string, callback: any }[] })[] = []

const socketIO = io(serverURL, {
    transports: ['websocket', 'polling', 'flashsocket']
});


const socket: {
    id: string
    on: (event: string, callback: (...others: any[]) => any) => any
    emit: (event: string, para?: any) => any
    emitWithLogin: (event: string, para?: any) => any
} = {
    id: socketIO.id,
    on(event, callback) {
        socketIO.on(event, callback);
    },
    emit(event: string, para?: any) {
        socketIO.emit(event, para);
    },
    emitWithLogin(event, para) {
        if (nowName) {
            socketIO.emit(event, para)
        }
        else {
            boardcast.alert('Please Login In');
        }
    }
}

export function on(component: any, event: string, callback: (...para: any[]) => any, only: boolean = true) {
    let index = components.findIndex((v) => { if (v.component == component) return true; });
    if (index == -1) {
        index = components.length;
        components.push({ component: component, listeners: [] });
    }
    let tmp = components[index];
    if (only && tmp.listeners.findIndex((v) => v.callback == callback) != -1) return;
    tmp.listeners.push({ event: event, callback: callback });
    socketIO.on(event, callback);
}

export function off(component: any) {
    let index = components.findIndex((v) => { if (v.component == component) return true; });
    if (index == -1) return;
    let tmp = components[index];
    for (let l of tmp.listeners) {
        socketIO.removeListener(l.event, l.callback);
    }
    console.log(socketIO.listeners('room-info'));
    tmp.listeners = [];
}

export default socket;