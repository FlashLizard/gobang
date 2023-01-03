import { GameInfo, GameResultInfo } from "@communication/parameters";
import { Player } from "src/Player";
import Room from "src/Room";


const dx = [1, 0, 1]
const dy = [0, 1, 1]

class Game {
    room: Room
    board: number[][]

    constructor(room: Room) {
        this.room = room;
        this.board = [];
        for (let i = 0; i < 6; i++) {
            let row = [];
            for (let j = 0; j < 6; j++) row.push(0);
            this.board.push(row);
        }
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
                    if(flag) return {winner: this.room.charaters[turn].name};
                }
            }
        }
        return null;
    }

    getInfo(): GameInfo {
        return {board: this.board}
    }

    async start(): Promise<GameResultInfo> {
        let turn = 0;
        let charaters = this.room.charaters;

        while (true) {
            let pos: [number, number] | null = await charaters[turn].request('action-pos', null, 60);
            if (pos) {
                this.board[pos[0]][pos[1]] = turn + 1;
                this.room.emit('game-info',{board: this.board})
            }
            else {
                return { winner: charaters[turn ^ 1].name };
            }
            let result = this.checkResult(this.board, turn);
            if (result) {
                return result;
            }
            turn ^= 1;
        }
    }
}

export default Game;