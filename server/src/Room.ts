import { RoomInfo,CharacterInfo } from "@communication/parameters";
import Character from "./Character";
import Player from "./Player";
import AI from "./AI";

class Room{
    name: string
    host: string
    isInGame: boolean = false
    charaters: (Character|null)[] = []
    maxCharaterCount: number
    minCharaterCount: number

    constructor(name: string, host:string, charaters?: Character[], maxCharaterCount: number = 2, minCharaterCount: number = 2) {
        this.name = name;
        if(charaters) {
            this.charaters = this.charaters.concat(charaters);
        }
        for(let i = this.charaters.length;i<maxCharaterCount;i++) {
            this.charaters.push(null);
        }
        this.maxCharaterCount = maxCharaterCount;
        this.minCharaterCount = minCharaterCount;
        this.host = host;
    }

    isFull(): boolean {
        return this.charaterCount() >= this.maxCharaterCount;
    }

    charaterCount(): number {
        let count = 0;
        for(let c of this.charaters) {
            if(c) count++;
        }
        return count;
    }

    okCount(): number {
        let count = 0;
        for(let c of this.charaters) {
            if(c && c.ok) count++;
        }
        return count;
    }

    getCharaterInfoList(): (CharacterInfo|null)[] {
        return this.charaters.map((v)=>v?v.getInfo():null);
    }

    addCharater(charater: Character):boolean {
        for(let i in this.charaters) {
            if(!this.charaters[i]) {
                this.charaters[i] = charater;
                if('room' in charater) {
                    charater.room = this;
                }
                this.emitInfo();
                return true;
            }
        }
        return false;
    }

    changeCharacterType(index: number) {
        if(this.charaters[index]) this.charaters[index] = null;
        else this.charaters[index] = new AI();
        this.emitInfo();
    }

    changeCharacter(index: number, charater: Character|null) {
        let preC:(Character|null) = this.charaters[index];
        this.charaters[index] = charater;
        if(charater && 'room' in charater) {
            charater.room = this;
        }
        if(preC instanceof Player)
        {
            let player = preC;
            player.emit('room-info',this.getInfo());
            player.room = null;
        }
        this.emitInfo();
    }

    emitInfo() {
        this.emit('room-info',this.getInfo());
    }

    getInfo(): RoomInfo {
        return {
            name: this.name,
            maxCount: this.maxCharaterCount,
            host: this.host,
            list: this.getCharaterInfoList(),
            count: this.charaterCount(),
            isIngame: this.isInGame
        };
    }

    emit(event: string, para: any) {
        for(let c of this.charaters) {
            if(c && 'emit' in c) {
                (c as Player).emit(event, para);
            }
        }
    }
}

export default Room;