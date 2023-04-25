import { io } from "socket.io-client";
import { boardSize, serverURL } from "./settings"
import { nowName } from "../components/login/Login";
import boardcast from "../tools/broadcast";
import { language, languageId } from "../context/language";

// 存放component对应的监听器
let components: ({ component: any, listeners: { event: string, callback: any }[] })[] = []

const socketIO = io(serverURL, {
    transports: ['websocket', 'polling', 'flashsocket']
});

const socket: {
    id: string
    lan: number
    on: (event: string, callback: (...others: any[]) => any) => any
    emit: (event: string, para?: any) => any
    emitWithLogin: (event: string, para?: any) => any
} = {
    id: socketIO.id,
    lan: languageId.zh,
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
            boardcast.alert(language.pleaseLogin[this.lan]);
        }
    }
}

// 为componet绑定监听事件
export function on(component: any, event: string, callback: (...para: any[]) => any, only: boolean = true) {

    //查找对应componet在数组中的位置
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

// 移除componet之前绑定的所有事件
export function off(component: any) {
    let index = components.findIndex((v) => { if (v.component == component) return true; });
    if (index == -1) return;
    let tmp = components[index];
    for (let l of tmp.listeners) {
        socketIO.removeListener(l.event, l.callback);
    }
    tmp.listeners = [];
}

export default socket;