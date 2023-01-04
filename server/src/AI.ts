import { CharacterInfo } from "@root/client/src/communication/parameters";
import Character from "./Character";

class AI extends Character{

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

    getInfo(): CharacterInfo {
        return {
            name: this.name,
            ok: true,
            type: 'AI',
        }
    }
    
    async request(event: string, para: any) {
        return [0,0];
    }

}

export default AI;