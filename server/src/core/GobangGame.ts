import { GobangGameInfo, GameResultInfo } from "@communication/parameters";
import Room from "src/Room";
import Game from "./Game";
import { boardSize, timeout } from "@root/client/src/communication/settings";
import { IABPor, INF } from "./AI/ABP";
import { random } from "src/tools/Random";
import { logger } from "src/tools/ServerLogger";

const dx = [1, 0, 1, -1]
const dy = [0, 1, 1, 1]


type GameAction = [number, number];
type HistoryActions = (GameAction | null)[][];
type GameState = { board: number[][], historyActions: HistoryActions };
const historyNum = 6;

class GobangGame extends Game {
    board: number[][]
    historyActions: HistoryActions = [[], []]

    constructor(room: Room) {
        super(room);
        this.board = [];
        for (let i = 0; i < boardSize; i++) {
            let row = [];
            for (let j = 0; j < boardSize; j++) row.push(-1);
            this.board.push(row);
        }
        for (let i = 0; i < historyNum; i++) {
            this.historyActions[0].push(null);
            this.historyActions[1].push(null);
        }
    }

    static check(room: Room) {
        return room.okCount() == 2 && !room.isInGame;
    }

    checkResult(board: GameState, turn: number): GameResultInfo | null {
        let re = GobangABP.checkResult(board, turn);
        if (re != null) {
            return { winner: this.room.charaters[re]?.name };
        }
        return null;
    }

    getInfo(): GameState {
        return { board: this.board, historyActions: this.historyActions };
    }

    async start(): Promise<GameResultInfo> {
        let turn = 0;
        let charaters = this.room.charaters;
        let result: GameResultInfo | null;
        while (true) {
            let pos: [number, number] | null = await charaters[turn]?.request('action-pos', this.getInfo(), timeout);
            if (pos) {
                this.board[pos[0]][pos[1]] = turn;
                this.historyActions[turn].shift();
                this.historyActions[turn].push(pos);
                this.room.emit('game-info', { board: this.board })
            }
            else {
                result = { winner: charaters[turn ^ 1]?.name };
                break;
            }
            result = this.checkResult({ board: this.board, historyActions: this.historyActions }, turn);
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

export class GobangABP implements IABPor<GameState, GameAction> {


    getSlotScore(gameState: GameState, x: number, y: number, turn:number,view: number): number { //myTurn: 如果是我导致了当前局面, 则为真
        let score = 0;
        let board = gameState.board;
        for (let d in dx) {
            let cnt = turn == view ? 0:1;
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
                        if (board[xx][yy] == view) {
                            cnt++;
                            if (cflag) ccnt += 1;
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
            if (flag)
            {
                if(cnt==5) return INF;
                score += cnt ** 5 + ccnt ** 5;
            }
        }
        return score;
    }

    getRange(gameState: GameState): [number, number, number, number] {
        let board = gameState.board;
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

    getRelativeSlot(begin: [number, number], direction: number, steps: number, reverse: boolean): [number, number] {
        let result: [number, number] = [begin[0], begin[1]];
        if (reverse) {
            for (let i = 0; i < steps; i++) {
                if (result[0] == 0 || result[1] == 0 || result[0] == boardSize - 1 || result[1] == boardSize - 1) return result;
                result[0] -= dx[direction];
                result[1] -= dy[direction];
            }
        }
        else {
            for (let i = 0; i < steps; i++) {
                if (result[0] == 0 || result[1] == 0 || result[0] == boardSize - 1 || result[1] == boardSize - 1) return result;
                result[0] += dx[direction];
                result[1] += dy[direction];
            }
        }
        return result;
    }

    estimate2(gameState: GameState, turn: number, view: number): number {
        let score = 0;
        let historyActions = gameState.historyActions;
        
        historyActions[turn].forEach((v, i) => {
            if (v) {
                for (let d in dx) {
                    let b = this.getRelativeSlot(v, Number(d), 4, true);
                    let e = this.getRelativeSlot(v, Number(d), 2, false);
                    for (let p = b; p[0] != e[0] + 1 && p[1] != e[1] + 1; ) {
                        score += this.getSlotScore(gameState, p[0], p[1], turn,view)*i*0.5;
                        p[0] += dx[d];
                        p[1] += dy[d];
                    }
                }
            }
        })
        historyActions[turn^1].forEach((v, i) => {
            if (v) {
                for (let d in dx) {
                    let b = this.getRelativeSlot(v, Number(d), 4, true);
                    let e = this.getRelativeSlot(v, Number(d), 2, false);
                    for (let p = b; p[0] != e[0] + 1 && p[1] != e[1] + 1; ) {
                        score -= this.getSlotScore(gameState, p[0], p[1], turn,view^1)*i*0.5;
                        p[0] += dx[d];
                        p[1] += dy[d];
                    }
                }
            }
        })
        return score;
    }

    estimate1(gameState: GameState, turn: number, view: number): number { //view: ai的顺序; turn:上一个下棋的导致了当前局面的人的回合
        let score = 0;
        let [l, r, t, b] = [0, boardSize - 1, 0, boardSize - 1];

        for (let i = t; i <= b; i++) {
            for (let j = l; j <= r; j++) {
                score += this.getSlotScore(gameState, i, j, turn, view);
            }
        }

        for (let i = t; i <= b; i++) {
            for (let j = l; j <= r; j++) {
                score -= this.getSlotScore(gameState, i, j, turn, view ^ 1);
            }
        }
        return score;
    }

    estimate(gameState: GameState, turn: number, view: number): number { //view: ai的顺序; turn:上一个下棋的导致了当前局面的人的回合
        return this.estimate1(gameState, turn, view);
    }

    checkResult(gameState: GameState, turn: number): number | null {
        return GobangABP.checkResult(gameState, turn);
    }

    static checkResult(gameState: GameState, turn: number): number | null { //-1 is no winner. null is not in end
        let board = gameState.board;
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
        let tmp = JSON.parse(JSON.stringify(originState)) as GameState;
        for (let i = t; i <= b; i++) {
            for (let j = l; j <= r; j++) {
                if (originState.board[i][j] == -1) {
                    tmp.board[i][j] = turn;
                    let tmph = JSON.parse(JSON.stringify(tmp.historyActions)) as HistoryActions;
                    tmp.historyActions[turn].shift();
                    tmp.historyActions[turn].push([i, j]);
                    yield { state: tmp as GameState, action: [i, j] as GameAction };
                    tmp.historyActions = tmph;
                    tmp.board[i][j] = -1;
                }
            }
        }
    }

}

export default GobangGame;