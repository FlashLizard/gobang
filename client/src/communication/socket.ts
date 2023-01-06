import {io} from "socket.io-client";
import {serverURL} from "./settings"

let components: ({component: any, listeners: {event: string, callback:any}[]})[] = []

const socket = io(serverURL, {
    transports: ['websocket', 'polling', 'flashsocket']
});

export function on(component: any, event: string, callback: (...para:any[])=>any, only: boolean = true) {
    let index = components.findIndex((v)=>{if(v.component == component) return true;});
    if(index == -1) {
        index = components.length;
        components.push({component: component, listeners: []});
    }
    let tmp = components[index];
    if(only && tmp.listeners.findIndex((v)=>v.callback==callback) != -1) return;
    tmp.listeners.push({event:event, callback:callback});
    socket.on(event,callback);
}

export function off(component: any) {
    let index = components.findIndex((v)=>{if(v.component == component) return true;});
    if(index == -1) return ;
    let tmp = components[index];
    for(let l of tmp.listeners) {
        socket.removeListener(l.event,l.callback);
    }
    console.log(socket.listeners('room-info'));
    tmp.listeners = [];
}

export default socket;