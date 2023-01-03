import { RoomInfo } from "@communication/parameters";
import Character from "./Character";
import { Player } from "./Player";

class Room{
    name: string
    isInGame: boolean = false
    charaters: Character[] = []
    maxCharaterCount: number
    minCharaterCount: number

    constructor(name: string, charaters?: Character[], maxCharaterCount: number = 10, minCharaterCount: number = 1) {
        this.name = name;
        if(charaters) {
            this.charaters = this.charaters.concat(charaters);
        }
        this.maxCharaterCount = maxCharaterCount;
        this.minCharaterCount = minCharaterCount;
    }

    isFull(): boolean {
        return this.charaterCount() >= this.maxCharaterCount;
    }

    charaterCount(): number {
        return this.charaters.length;
    }

    addCharater(charater: Character) {
        this.charaters.push(charater);
    }

    getInfo(): RoomInfo {
        return {
            name: this.name,
            maxCount: this.maxCharaterCount,
            count: this.charaterCount(),
            isIngame: this.isInGame
        };
    }

    emit(event: string, para: any) {
        for(let c of this.charaters) {
            if('emit' in c) {
                (c as Player).emit(event, para);
            }
        }
    }
}

export default Room;