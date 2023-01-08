import { GobangGameInfo, GameResultInfo } from "@communication/parameters";
import AI from "src/AI";
import gameManager from "src/GameManager";
import Player from "src/Player";
import Room from "src/Room";
import { logger } from "src/tools/ServerLogger";

abstract class Game {
    room: Room|undefined
    audience: (Player|null|undefined)[]

    constructor(room: Room) {
        this.room = room;
        this.room.game = this
        this.room.charaters.forEach((c, i) => {
            if (c instanceof Player) {
                c.game = this;
            }
            if (c && c instanceof AI && 'initialize' in c) {
                c.initialize(i);
            }
        });
        this.audience = []
    }

    abstract getInfo(...others:any[]): any

    async startWithAbort() {
        let promises = []
        if(!this.room) return;
        for (let c of this.room.charaters) {
            if (c instanceof Player) {
                promises.push(new Promise(async (resolve, reject) => {
                    await (c as Player).request('abort', null, 60 * 60 * 1000, false);
                    this.end({ player: c?.name ,desc:'abort'});
                    resolve(null);
                    logger.info(`${(c as Player).name} abort`);
                }));
                // promises.push(new Promise(async (resolve, reject) => {
                //     await (c as Player).request('disconnect', null, 60 * 60 * 1000, false);
                //     this.end({ player: null, desc:'disconnect'});
                //     resolve(null);
                // }));
            }
        }
        promises.push(new Promise(async (resolve, reject) => {
            this.emitStartInfo();
            let result = await this.run();
            this.end(result);
            resolve(null);
        }));
        return Promise.race(promises);
    }

    emitStartInfo() {
    }

    emitInfo(...para:any[]) {
        let info = this.getInfo(...para);
        this.room?.emit('game-info', info);
        for (let c of this.audience) {
            c?.emit('game-info',info);
        }
    }

    abstract run(): Promise<GameResultInfo>

    end(result: GameResultInfo) {
        if(!this.room) return;
        this.room.game = null;
        for (let c of this.room.charaters) {
            if (c instanceof Player) {
                c.game = null;
                c.emit('game-end', result);
            }
        }
        for (let c of this.audience) {
            if(c) c.game = null;
            c?.emit('game-end', result);
        }
        gameManager.removeGame(this);
    }
}

export default Game;