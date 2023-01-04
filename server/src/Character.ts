import { CharacterInfo, RequestPara } from "@root/client/src/communication/parameters";

abstract class Character {
    name: string = ""
    type: 'None' | 'Player' | 'AI' = "None"
    ok: boolean = false

    abstract request(event: string, para?: RequestPara, time?: number, showTime?: boolean): Promise<any>;
    getInfo(): CharacterInfo {
        return {
            name: this.name,
            type: this.type,
            ok: this.ok
        };
    }

}

export default Character;