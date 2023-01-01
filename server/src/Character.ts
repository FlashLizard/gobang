import { Socket } from "socket.io";

interface Character{
    on: (event: string, callback: (...args:any ) => any) => any;
    emit: (event: string, ...args: any[]) => any;
}

export class Player implements Character{
    socket: Socket
    name: string

    constructor(name: string, socket: Socket) {
        this.name = name;
        this.socket = socket;
    }

    on(event: string, callback: (...args: any) => any) {
        this.socket.on(event, callback);
    }

    emit(event: string, ...args: any[]) {
        this.socket.emit(event, ...args)
    }
}

export default Character;