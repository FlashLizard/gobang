import { Socket } from "socket.io";
import roomManager from "./RoomManager";
import { logger } from "./App";
interface Character {

    on: (event: string, callback: (...args: any[]) => any) => any;
    request: (event: string, para: any, time?: number) => Promise<any>;

}

export class Player implements Character {
    roomName: string | null = null
    socket: Socket
    name: string

    constructor(name: string, socket: Socket) {
        this.name = name;
        this.socket = socket;
        this.joinRoom = this.joinRoom.bind(this);

        this.on('join-room', this.joinRoom)
        this.on('create-room', (name: string) => {
            if(roomManager.getRoom(name)) {
                this.emit('response-create-room', {code: false, desc: 'ExistRoom'})
            }
            else {
                this.emit('response-create-room', {code: true, desc: 'Success'})
                roomManager.createRoom(name);
                this.joinRoom(name);
            }
        })
    }

    on(event: string, callback: (para: any) => any) {
        this.socket.on(event, callback);
    }

    joinRoom(name: string) {
        if (this.roomName) {
            this.emit('response-join-room',{code: false, desc: 'AlreadyInOtherRoom'});
        }
        let room = roomManager.getRoom(name);
        if (room) {
            if(room.isInGame) {
                this.emit('response-join-room',{code: false, desc: 'RoomIsInGame'});
            }
            else if(room.isFull()) {
                this.emit('response-join-room',{code: false, desc: 'RoomIsFull'});
            }
            this.emit('response-join-room',{code: true, desc: 'Success'});
            room.addCharater(this);
        }
        else {
            this.emit('response-join-room',{code: false, desc: 'NoRoom'});
        }
    }

    async request(event: string, para: any, time: number = 30) {
        logger.info('Player '+this.name+' Emit Request: ', event, para);
        return await new Promise<any>((resolve, reject) => {
            let res = (para: any) => {
                resolve(para);
                logger.info('Player '+this.name+' Get Request: ', event, para)
            }
            time *= 1000;
            let visited = false;
            let timer = setInterval(() => {
                this.emit('rest-time', time / 1000, false);
                if (time <= 0) {
                    clearInterval(timer);
                    res(null);
                }
                time -= 1000;
            }, 1000);
            this.socket.once('resolve-' + event, (para: any) => {
                visited = true;
                res(para);
                clearInterval(timer)
            })
            this.socket.emit(event, para);
        })
    }

    emit(event: string, para: any, showInLog: boolean = true) {
        if(showInLog) logger.info('Player '+this.name+' Emit Event: ', event, para);
        this.socket.emit(event, para);
    }
}

export default Character;