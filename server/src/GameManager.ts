import { RoomInfo } from "@root/client/src/communication/parameters";
import Room from "./Room";
import Game from "./core/Game";
import GobangGame from "./core/GobangGame";

export type GameType = 'Gobang';

const gameManager: {
    games: Game[]
    createGame(type: GameType, room: Room): Game | null
    removeGame(game:Game): boolean
} = {
    games: [],
    createGame(type: GameType, room: Room): Game | null {
        let game: Game | null = null;
        switch (type) {
            case 'Gobang':
                if (GobangGame.check(room)) {
                    game = new GobangGame(room);
                }
                break;
        }
        if (game) {
            this.games.push(game);
            setTimeout(() => {
                game?.startWithAbort();
            }, 500);
        }
        return game;
    },
    removeGame(game:Game) {
        let index = this.games.indexOf(game);
        if(index==-1) return false;
        if(this.games.splice(index).length==0) return false;
        return true;
    }
};

export default gameManager;