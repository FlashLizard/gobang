import Character from "./Character";

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
}

export default Room;