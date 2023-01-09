import { CharacterInfo } from "@root/client/src/communication/parameters";
import Character, { RequestEvent, RequestPara } from "./Character";
import { GobangRequest, GobangABP } from "./core/GobangGame";
import ABP from "./core/AI/ABP";
import { aiPara } from "@root/client/src/communication/settings";

class AI extends Character{
    abp: ABP<any,any> | null = null
    other: number

    constructor(name?: string|null,other:number=0) {
        super();
        this.ok = true;
        this.type = 'AI';
        this.other = other;

        if(name) {
            this.name = name;
        }
        else {
            this.name = `Robot${Math.floor(Math.random()*10)}`;
        }
    }

    initialize(turn: number,depth: number = 2) {
        this.abp = new ABP(new GobangABP(aiPara[this.other]),turn,depth);
    }

    getInfo(): CharacterInfo {
        return {
            name: this.name,
            ok: true,
            type: 'AI',
            other: this.other,
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