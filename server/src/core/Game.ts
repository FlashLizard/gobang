import { GobangGameInfo, GameResultInfo } from "@communication/parameters";
import AI from "src/AI";
import gameManager from "src/GameManager";
import Player from "src/Player";
import Room from "src/Room";
import { logger } from "src/tools/ServerLogger";

abstract class Game {
    room: Room|undefined

    constructor(room: Room) {
        this.room = room;
        this.room.isInGame = true;
        this.room.charaters.forEach((c, i) => {
            if (c instanceof Player) {
                c.game = this;
            }
            if (c && c instanceof AI && 'initialize' in c) {
                c.initialize(i);
            }
        });
    }

    abstract getInfo(): any

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
            let result = await this.run();
            this.end(result);
            resolve(null);
        }));
        return Promise.race(promises);
    }

    emitInfo() {
        this.room?.emit('game-info', this.getInfo());
    }

    abstract run(): Promise<GameResultInfo>

    end(result: GameResultInfo) {
        if(!this.room) return;
        this.room.isInGame = false;
        for (let c of this.room.charaters) {
            if (c instanceof Player) {
                c.game = null;
                c.emit('game-end', result);
            }
        }
        gameManager.removeGame(this);
    }
}

export default Game;