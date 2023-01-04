import { GobangGameInfo, GameResultInfo } from "@communication/parameters";
import Room from "src/Room";
import Game from "./Game";
import Player from "src/Player";

const dx = [1, 0, 1]
const dy = [0, 1, 1]

class GobangGame extends Game{
    board: number[][]

    constructor(room: Room) {
        super(room);
        this.board = [];
        for (let i = 0; i < 6; i++) {
            let row = [];
            for (let j = 0; j < 6; j++) row.push(0);
            this.board.push(row);
        }
    }

    static check(room: Room) {
        return room.okCount() == 2 && !room.isInGame;
    }

    checkResult(board: number[][], turn: number): GameResultInfo | null {
        let flag = true;
        for (let r of board) {
            for (let v of r) {
                if (v == 0) {
                    flag = false;
                    break;
                }
            }
            if(!flag) break;
        }
        if (flag) {
            return { winner: null };
        }
        for (let i in board) {
            for (let j in board[i]) {
                if (board[i][j] != turn + 1) continue;
                let flag: boolean;
                for (let d = 0; d < 3; d++) {
                    flag = true;
                    let x = Number(i), y = Number(j);
                    for (let s = 0; s < 4; s++) {
                        x += dx[d];
                        y += dy[d];
                        if(!board[x] || !board[x][y] || board[x][y] != turn + 1) {
                            flag = false;
                            break;
                        }
                    }
                    if(flag) return {winner: this.room.charaters[turn]!.name};
                }
            }
        }
        return null;
    }

    getInfo(): GobangGameInfo {
        return {board: this.board}
    }

    async start(): Promise<GameResultInfo> {
        let turn = 0;
        let charaters = this.room.charaters;
        let result:GameResultInfo|null;
        while (true) {
            let pos: [number, number] | null = await charaters[turn]?.request('action-pos', null, 10);
            if (pos) {
                this.board[pos[0]][pos[1]] = turn + 1;
                this.room.emit('game-info',{board: this.board})
            }
            else {
                result =  { winner: charaters[turn ^ 1]?.name };
                break;
            }
            result = this.checkResult(this.board, turn);
            if (result) {
                break;
            }
            turn ^= 1;
        }
        this.end();
        return result;
    }
}

export default GobangGame;