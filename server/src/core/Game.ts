import { GobangGameInfo, GameResultInfo } from "@communication/parameters";
import AI from "src/AI";
import Player from "src/Player";
import Room from "src/Room";
import { logger } from "src/tools/ServerLogger";

abstract class Game {
    room: Room

    constructor(room: Room) {
        this.room = room;
        this.room.isInGame = true;
        this.room.charaters.forEach((c,i) => {
            if (c instanceof Player) {
                c.game = this;
            }
            if (c && c instanceof AI && 'initialize' in c ) {
                c.initialize(i);
            }
        });
    }

    abstract getInfo(): any

    async startWithAbort(): Promise<GameResultInfo> {
        let promises = []
        for (let c of this.room.charaters) {
            if (c instanceof Player) {
                promises.push(new Promise<GameResultInfo>(async (resolve, reject) => {
                    await (c as Player).request('abort', null, 60*60*1000, false);
                    this.end();
                    resolve({ winner: null });
                    logger.info(`${(c as Player).name} abort`);
                }));
            }
        }
        promises.push(new Promise<GameResultInfo>(async (resolve,reject) => resolve(await this.start())));
        return Promise.race(promises);
    }

    abstract start(): Promise<GameResultInfo>

    end() {
        this.room.isInGame = false;
        for (let c of this.room.charaters) {
            if (c instanceof Player) {
                c.game = null;
            }
        }
    }
}

export default Game;