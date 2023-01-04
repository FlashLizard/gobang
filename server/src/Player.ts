import { Socket } from "socket.io";
import Character from "./Character";
import roomManager from "./RoomManager";
import { randomUUID } from "crypto";
import AI from "./AI";
import Room from "./Room";
import { logger } from "./ServerLogger";
import Game from "./core/Game";
import { CharacterInfo } from "@root/client/src/communication/parameters";
import GobangGame from "./core/GobangGame";
import gameManager from "./GameManager";

class Player extends Character {
    private _room: Room | null = null
    socket: Socket
    game: Game | null = null

    constructor(name: string, socket: Socket) {
        super();
        this.name = name;
        this.socket = socket;
        this.joinRoom = this.joinRoom.bind(this);
        this.startGame = this.startGame.bind(this);
        this.setOn();
        this.type = 'Player';
        this.ok = false;
    }

    public set room(value) {
        this.emit('room-info');
        this._room = value;
    }

    public get room() {
        return this._room;
    }

    getInfo(): CharacterInfo {
        return {
            name: this.name,
            ok: this.ok,
            type: 'Player',
        };
    }

    startGame() {
        this.ok = true;
        if (this.room) {
            this.game = gameManager.createGame('Gobang', this.room);
            if (this.game) {
                this.room.emit('response-start-game', { code: true, desc: 'Success' });
            }
            else {
                logger.info(`${this.name} room illegal`);
                this.room.emit('response-start-game', { code: false, desc: "Illegal Room" });
            }
        }
        else {
            this.socket.emit('response-start-game', { code: false, desc: "Not In A Room" });
        }
    }

    setOn() {
        this.on('start-game', this.startGame)
        this.on('kick-player', (para: number) => {
            this.room?.changeCharacter(para, null);
        })
        this.on('change-charater-type', (para: number) => {
            this.room?.changeCharacterType(para);
        })
        this.on('join-room', this.joinRoom)
        this.on('create-room', (name: string) => {
            logger.info(`Player ${this.name} try to create room ${name}`);
            if (roomManager.getRoom(name)) {
                this.emit('response-create-room', { code: false, desc: 'ExistRoom' })
            }
            else {
                this.emit('response-create-room', { code: true, desc: 'Success' })
                let room = roomManager.createRoom(name, this.name);
                this.ok = false;
                this.joinRoom(room);
            }
        })
        this.on('quick-game', (turn: number) => {
            let room = roomManager.createRoom(Math.floor(Math.random()*1000).toString(), this.name);
            this.ok = true;
            if (turn == 0) {
                this.joinRoom(room);
                room.addCharater(new AI());
            }
            else {
                room.addCharater(new AI());
                this.joinRoom(room);
            }
            this.startGame();
        })
        this.on('get-room-info', () => {
            this.emit('room-info', this.room?.getInfo());
        })
        this.on('get-room-list', () => {
            this.emit('room-list', roomManager.getRoomList());
        });
        this.on('get-game-info', () => {
            if (this.game) {
                this.emit('game-info', this.game.getInfo());
            }
            else {
                this.emit('game-info', null);
            }
        })
        this.on('exit-room', () => {
            if (this.room) {
                let index = this.room.charaters.indexOf(this);
                if(index != -1 ) this.room.changeCharacter(index, null);
            }
        })
        this.on('change-ok', (para:boolean)=>{
            this.ok = para;
            this.room?.emitInfo();
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
            if (this.room) {
                this.emit('response-join-room', { code: false, desc: 'AlreadyInOtherRoom' });
                return;
            }
            room = roomManager.getRoom(room);
        }
        if (room) {
            if (room.isInGame) {
                this.emit('response-join-room', { code: false, desc: 'RoomIsInGame' });
                return;
            }
            else if (room.isFull()) {
                this.emit('response-join-room', { code: false, desc: 'RoomIsFull' });
                return;
            }
            this.emit('response-join-room', { code: true, desc: 'Success' });
            room.addCharater(this);
        }
        else {
            this.emit('response-join-room', { code: false, desc: 'NoRoom' });
        }
    }

    async request(event: string, para?: any, time: number = 30, showTime: boolean = true) {
        logger.info('Player ' + this.name + ' Emit Request: ', event, para);
        return await new Promise<any>((resolve, reject) => {
            let res = (para: any) => {
                resolve(para);
                logger.info('Player ' + this.name + ' Get Request: ', event, para)
            }
            time *= 1000;
            let timer = setInterval(() => {
                if(showTime) this.emit('rest-time', time / 1000, false);
                if (time <= 0) {
                    if(showTime) this.emit('time-out', { event: event });
                    this.socket.removeAllListeners('resolve-' + event);
                    clearInterval(timer);
                    res(null);
                }
                time -= 1000;
            }, 1000);
            this.socket.once('resolve-' + event, (para: any) => {
                res(para);
                clearInterval(timer);
                this.emit('action-finished');
            })
            this.socket.emit(event, para);
        })
    }

    emit(event: string, para?: any, showInLog: boolean = true) {
        if (showInLog) logger.info('Player ' + this.name + ' Emit Event: ' + event + ` ${para}`);
        this.socket.emit(event, para);
    }
}

export default Player;