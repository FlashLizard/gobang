import { Socket } from "socket.io";
import Character from "./Character";
import roomManager from "./RoomManager";
import { randomUUID } from "crypto";
import AI from "./AI";
import Room from "./Room";
import { logger } from "./ServerLogger";
import Game from "./core/game";

export class Player implements Character {
    roomName: string | null = null
    socket: Socket
    name: string
    game: Game | null = null

    constructor(name: string, socket: Socket) {
        this.name = name;
        this.socket = socket;
        this.joinRoom = this.joinRoom.bind(this);
        this.setOn();
    }

    setOn() {
        this.on('join-room', this.joinRoom)
        this.on('create-room', (name: string) => {
            if (roomManager.getRoom(name)) {
                this.emit('response-create-room', { code: false, desc: 'ExistRoom' })
            }
            else {
                this.emit('response-create-room', { code: true, desc: 'Success' })
                let room = roomManager.createRoom(name);
                this.joinRoom(room);
            }
        })
        this.on('quick-game', (turn: number) => {
            let room = roomManager.createRoom(randomUUID());
            if(turn == 0) {
                this.joinRoom(room);
                room.addCharater(new AI());
            }
            else {
                room.addCharater(new AI());
                this.joinRoom(room);
            }
        })
        this.on('get-room-list', () => {
            logger.info(`${this.socket.id} try to get room list`);
            this.emit('room-list', roomManager.getRoomList());
        });
        this.on('get-game-info', () => {
            if(this.game) {
                this.emit('game-info',this.game.getInfo());
            }
            else {
                this.emit('game-info',null);
            }
        })
    }

    freshSocket(socket: Socket) {
        this.socket = socket;
        this.setOn();
    }

    on(event: string, callback: (para: any) => any) {
        this.socket.on(event, callback);
    }

    joinRoom(room: string | Room) {
        if (typeof room == 'string') {
            if (this.roomName) {
                this.emit('response-join-room', { code: false, desc: 'AlreadyInOtherRoom' });
            }
            room = roomManager.getRoom(room);
        }
        if (room) {
            if (room.isInGame) {
                this.emit('response-join-room', { code: false, desc: 'RoomIsInGame' });
            }
            else if (room.isFull()) {
                this.emit('response-join-room', { code: false, desc: 'RoomIsFull' });
            }
            this.emit('response-join-room', { code: true, desc: 'Success' });
            room.addCharater(this);
        }
        else {
            this.emit('response-join-room', { code: false, desc: 'NoRoom' });
        }
    }

    async request(event: string, para: any, time: number = 30) {
        logger.info('Player ' + this.name + ' Emit Request: ', event, para);
        return await new Promise<any>((resolve, reject) => {
            let res = (para: any) => {
                resolve(para);
                logger.info('Player ' + this.name + ' Get Request: ', event, para)
            }
            time *= 1000;
            let timer = setInterval(() => {
                this.emit('rest-time', time / 1000, false);
                if (time <= 0) {
                    this.emit('time-out', { event: event });
                    this.socket.removeAllListeners('resolve-' + event);
                    clearInterval(timer);
                    res(null);
                }
                time -= 1000;
            }, 1000);
            this.socket.once('resolve-' + event, (para: any) => {
                res(para);
                clearInterval(timer)
            })
            this.socket.emit(event, para);
        })
    }

    emit(event: string, para: any, showInLog: boolean = true) {
        if (showInLog) logger.info('Player ' + this.name + ' Emit Event: ' + event +`${para}`);
        this.socket.emit(event, para);
    }
}