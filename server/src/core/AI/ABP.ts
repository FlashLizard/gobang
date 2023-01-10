import { Type } from "typescript";
import { info } from "winston";
import { random } from "src/tools/Random";
import { logger } from "src/tools/ServerLogger";

export interface IABPor<GameState, GameAction> {
    
    estimate(gameState: GameState, turn: number, view: number): number
    checkResult(gameState: GameState,turn:number): number | null
    branches(originState: GameState, turn: number) : Generator<{state: GameState, action: GameAction}>

}

export const INF = 1e9;

class ABP<GameState, GameAction> {
    gameABP: IABPor<GameState, GameAction>
    depth: number
    view: number

    constructor(game: IABPor<GameState, GameAction>, view: number, depth: number = 2) {
        this.gameABP = game;
        this.depth = depth;
        this.view = view;
    }

    //even depth: choose max; odd depth: choose min
    getScore(state: GameState, turn: number, restDepth: number, fatherScore: number): number { //null is full; turn is will action,所以turn^1是导致了当前局面的
 
        let re:number|null=this.gameABP.checkResult(state,turn^1);
        if(re!=null) {
            if(re==-1) return 0;
            //logger.info(`result ${turn^1} ${restDepth}`);
            return (turn^1)==this.view?INF:-INF;
        }
        if(restDepth == 0) {
            
            //logger.info(`est ${turn^1} ${restDepth} ${(state as any).board}`);
            return this.gameABP.estimate(state,turn^1,this.view);
        }
        else {
            let even = this.view == turn;
            let nowScore = even?-INF:INF;
            for(let next of this.gameABP.branches(state,turn)) {
                let score = this.getScore(next.state,turn^1,restDepth-1, nowScore);
                if(even) {
                    nowScore = Math.max(score, nowScore);
                    if(nowScore>=INF||fatherScore<nowScore) return nowScore;
                }
                else {
                    nowScore = Math.min(score, nowScore);
                    if(nowScore<=-INF||fatherScore>nowScore) return nowScore;
                }
            }
            return nowScore;
        }
    }

    getAction(state: GameState,depth:number = this.depth): GameAction|null {
        let score = -INF;
        let choices:GameAction[] = []
        for(let choice of this.gameABP.branches(state,this.view)) {
            let cScore = this.getScore(choice.state,this.view^1,depth-1,score);
            if(score == cScore) {
                choices.push(choice.action);
            }
            if(score < cScore) {
                score = cScore;
                choices = [choice.action]
            }
            if(score>=INF)
            {
                logger.info(`win ${choice.action}`);
                break;
            }
        }

        if(choices.length==0){
            logger.error(`${score}`);
            return null;
        }
        let action = choices[random(0,choices.length-1)]
        logger.info(`action ${score} ${action}`)
        return action;
    }
}

export default ABP;