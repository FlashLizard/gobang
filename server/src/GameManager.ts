import { RoomInfo } from "@root/client/src/communication/parameters";
import Room from "./Room";
import Game from "./core/Game";
import GobangGame from "./core/GobangGame";

type GameType = 'Gobang';

const gameManager: {
    games: Game[]
    createGame(type: GameType, room: Room): Game | null
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
            setTimeout(async () => {
                let result = await game!.startWithAbort();
                room.emit('game-end',result);
                delete this.games[this.games.indexOf(game!)];
            }, 500);
        }
        return game;
    }
};

export default gameManager;