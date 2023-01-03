import Character from "./Character";

class AI implements Character{
    name: string

    constructor(name?: string) {
        if(name) {
            this.name = name;
        }
        else {
            this.name = `Robot${Math.floor(Math.random()*10)}`;
        }
    }

    on(event: string, callback: (para: any) => any) {

    }
    
    async request(event: string, para: any) {
        
    }

}

export default AI;