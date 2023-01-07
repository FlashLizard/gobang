import { CharacterInfo } from "@root/client/src/communication/parameters";
import Character, { RequestEvent, RequestPara } from "./Character";
import { GobangRequest, GobangABP } from "./core/GobangGame";
import ABP from "./core/AI/ABP";

class AI extends Character{
    abp: ABP<any,any> | null = null

    constructor(name?: string) {
        super();
        this.ok = true;
        this.type = 'AI';

        if(name) {
            this.name = name;
        }
        else {
            this.name = `Robot${Math.floor(Math.random()*10)}`;
        }
    }

    initialize(turn: number,depth: number = 3) {
        this.abp = new ABP(new GobangABP(),turn,depth);
    }

    getInfo(): CharacterInfo {
        return {
            name: this.name,
            ok: true,
            type: 'AI',
        }
    }
    
    async request<event extends RequestEvent>(event: RequestEvent, para: typeof RequestPara[event] | null) {

        switch(event) {
            case 'action-pos':
                return this.abp?.getAction(para);
        }
        return null;
    }
}

export default AI;