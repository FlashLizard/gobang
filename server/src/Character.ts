import { CharacterInfo } from "@root/client/src/communication/parameters";
import { Type } from "typescript";

export type RequestEvent = 'action-pos' | 'abort';

export const RequestPara = {
    ['action-pos']: {board:[[1],],historyActions:[new Array<[number,number]|null>()]},
    ['abort']: null
};

abstract class Character {
    name: string = ""
    type: 'None' | 'Player' | 'AI' = "None"
    ok: boolean = false

    abstract request<event extends RequestEvent>(event: RequestEvent, para?: typeof RequestPara[event] | null, time?: number, showTime?: boolean): Promise<any>;
    getInfo(): CharacterInfo {
        return {
            name: this.name,
            type: this.type,
            ok: this.ok
        };
    }

}

export default Character;