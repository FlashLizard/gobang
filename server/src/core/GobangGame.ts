import { GobangGameInfo, GameResultInfo } from "@communication/parameters";
import Room from "src/Room";
import Game from "./Game";
import { boardSize, timeout } from "@root/client/src/communication/settings";
import { IABPor } from "./AI/ABP";
import { random } from "src/tools/Random";
import { logger } from "src/tools/ServerLogger";
import Logger from "src/tools/Logger";

const dx = [1, 0, 1, -1]
const dy = [0, 1, 1, 1]

type GameState = number[][];
type GameAction = [number, number];

class GobangGame extends Game {
    board: GameState

    constructor(room: Room) {
        super(room);
        this.board = [];
        for (let i = 0; i < boardSize; i++) {
            let row = [];
            for (let j = 0; j < boardSize; j++) row.push(-1);
            this.board.push(row);
        }
    }

    static check(room: Room) {
        return room.okCount() == 2 && !room.isInGame;
    }

    checkResult(board: GameState, turn: number): GameResultInfo | null {
        let re = gobangABP.checkResult(board, turn);
        if (re != null) {
            return { winner: this.room.charaters[re]?.name };
        }
        return null;
    }

    getInfo(): GobangGameInfo {
        return { board: this.board }
    }

    async start(): Promise<GameResultInfo> {
        let turn = 0;
        let charaters = this.room.charaters;
        let result: GameResultInfo | null;
        while (true) {
            let pos: [number, number] | null = await charaters[turn]?.request('action-pos', this.board, timeout);
            if (pos) {
                this.board[pos[0]][pos[1]] = turn;
                this.room.emit('game-info', { board: this.board })
            }
            else {
                result = { winner: charaters[turn ^ 1]?.name };
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

export interface GobangRequest {
    actionPosRequest(gameState: GameState): [number, number] | null
}

class GobangABP implements IABPor<GameState, GameAction> {

    getSlotScore(board: GameState, x: number, y: number, view: number, myTurn: boolean): number { //myTurn: 如果是我导致了当前局面, 则为真
        let score = 0;
        for (let d in dx) {
            let cnt = 0//!myTurn ? 0 : 1;
            let ccnt = 0
            let cflag = false;
            let flag = true;
            let [xx, yy] = [x, y];
            for (let i = 0; i < 5; i++) {
                if (board[xx] == undefined || board[xx][yy] == undefined) {
                    flag = false;
                    break;
                }
                else {
                    if (board[xx][yy] != -1) {
                        if (board[xx][yy] == view) 
                        {
                            cnt++;
                            if(cflag) ccnt+=1;
                            cflag = true;
                        }
                        else {
                            flag = false;
                            break;
                        }
                    }
                    else {
                        cflag = false;
                    }
                    xx += dx[d];
                    yy += dy[d];
                }
            }
            if (flag) score += cnt **5 + ccnt**5;
        }
        return score;
    }

    getRange(board: GameState): [number, number, number, number] {
        let [l, r, t, b] = [boardSize, -1, boardSize, -1];
        let flag = true;
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (board[i][j] != -1) {
                    l = Math.min(l, j);
                    r = Math.max(r, j);
                    t = Math.min(t, i);
                    b = Math.max(b, i);
                    flag = false;
                }
            }
        }

        if (flag) {
            l = r = random(3, boardSize - 4);
            t = b = random(3, boardSize - 4);
        }
        

        l = Math.max(l - 1, 0);
        r = Math.min(r + 1, boardSize - 1);
        t = Math.max(t - 1, 0);
        b = Math.min(b + 1, boardSize - 1);
        
        if (r - l <= 5) {
            let w = 5 - (r - l);
            if (l >= w) l -= w;
            else {
                w -= l;
                l = 0;
                r += w;
            }
        }
        if (b - t <= 5) {
            let w = 5 - (b - t);
            if (t >= w) t -= w;
            else {
                w -= t;
                t = 0;
                b += w;
            }
        }
        return [l, r, t, b];
    }

    estimate(board: GameState, turn: number, view: number): number { //view: ai的顺序; turn:上一个下棋的导致了当前局面的人的回合
        let score = 0;
        let [l, r, t, b] = [0,boardSize-1,0,boardSize-1];

        for (let i = t; i <= b; i++) {
            for (let j = l; j <= r; j++) {
                score += this.getSlotScore(board, i, j, view, view == turn);
            }
        }

        for (let i = t; i <= b; i++) {
            for (let j = l; j <= r; j++) {
                score -= this.getSlotScore(board, i, j, view ^ 1, view != turn);
            }
        }
        return score;
    }

    checkResult(board: GameState, turn: number): number | null { //-1 is no winner. null is not in end
        for (let i in board) {
            for (let j in board[i]) {
                if (board[i][j] != turn) continue;
                let flag: boolean;
                for (let d in dx) {
                    flag = true;
                    let x = Number(i), y = Number(j);
                    for (let s = 0; s < 4; s++) {
                        x += dx[d];
                        y += dy[d];
                        if (board[x] == undefined || board[x][y] == undefined || board[x][y] != turn) {
                            flag = false;
                            break;
                        }
                    }
                    if (flag) return turn;
                }
            }
        }
        let flag = false;
        for (let r of board) {
            for (let v of r) {
                if (v == -1) {
                    flag = true;
                    break;
                }
            }
            if (flag) break;
        }
        if (flag) {
            return null;
        }
        return -1;
    }
    * branches(originState: GameState, turn: number) {
        let [l, r, t, b] = this.getRange(originState);
        let tmp = JSON.parse(JSON.stringify(originState));

        for (let i = t; i <= b; i++) {
            for (let j = l; j <= r; j++) {
                if (originState[i][j] == -1) {

                    tmp[i][j] = turn;
                    yield { state: tmp as GameState, action: [i, j] as GameAction };
                    tmp[i][j] = -1;
                }
            }
        }
    }

}

export const gobangABP = new GobangABP();

export default GobangGame;