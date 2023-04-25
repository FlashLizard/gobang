import { RoomInfo, CharacterInfo } from "@communication/parameters";
import Character from "./Character";
import Player from "./Player";
import AI from "./AI";
import roomManager from "./RoomManager";
import Game from "./core/Game";

class Room {
    name: string
    private _host: Player | undefined | null;
    game: Game|null|undefined
    charaters: (Character | null)[] = [];
    maxCharaterCount: number
    minCharaterCount: number

    
    public get host(): Player | undefined | null {
        return this._host;
    }
    public set host(value: Player | undefined | null) {
        this._host = value;
        if(!value) {
            this.checkRoom();
        }
    }

    constructor(name: string, host: Player, charaters?: Character[], maxCharaterCount: number = 2, minCharaterCount: number = 2) {
        this.name = name;
        if (charaters) {
            this.charaters = this.charaters.concat(charaters);
        }
        for (let i = this.charaters.length; i < maxCharaterCount; i++) {
            this.charaters.push(null);
        }
        this.maxCharaterCount = maxCharaterCount;
        this.minCharaterCount = minCharaterCount;
        this.host = host;
    }

    isFull(): boolean {
        return this.charaterCount() >= this.maxCharaterCount;
    }

    playerCount(): number {
        let count = 0;
        for (let c of this.charaters) {
            if (c instanceof Player) count++;
        }
        return count;
    }

    charaterCount(): number {
        let count = 0;
        for (let c of this.charaters) {
            if (c) count++;
        }
        return count;
    }

    okCount(): number {
        let count = 0;
        for (let c of this.charaters) {
            if (c && c.ok) count++;
        }
        return count;
    }

    getCharaterInfoList(): (CharacterInfo | null)[] {
        return this.charaters.map((v) => v ? v.getInfo() : null);
    }

    checkRoom() {//If You change charaters, must add the function
        let pcnt = this.playerCount();
        if (pcnt == 0 && !this.host) {
            roomManager.removeRoom(this);
        }
        else if (pcnt == 1 && !this.host) {
            for (let c of this.charaters) {
                if (c instanceof Player) {
                    this.host = c;
                }
            }
            this.emitInfo();
        }
    }

    exitPlayer(player: number | Player) {
        let p:Player;
        if (player instanceof Player) {
            p=player;
            let index = this.charaters.indexOf(player);
            if (index != -1) this.changeCharacter(index, null);
        }
        else {
            p = this.charaters[player] as Player;
            this.changeCharacter(player, null);
        }
        if(this.host==p) {
            this.host = null;
        }
    }

    addCharater(charater: Character): boolean {
        let res: boolean = false;
        for (let i in this.charaters) {
            if (!this.charaters[i]) {
                this.charaters[i] = charater;
                if ('room' in charater) {
                    charater.room = this;
                }
                this.emitInfo();
                res = true;
                break;
            }
        }
        this.checkRoom();
        return res;
    }

    changeCharacterType(index: number) {
        let ori = this.charaters[index];
        if (ori && ori!=this.host) this.charaters[index] = null;
        else this.charaters[index] = new AI();
        this.emitInfo();
        this.checkRoom();
    }

    changeTurn(player:Player, index:number) {
        let ori = this.charaters.indexOf(player);
        if(ori!=-1) this.changeCharacter(ori,null,true);
        this.changeCharacter(index,player);
    }

    changeCharacter(index: number, charater: Character | null, notKick:boolean=false) {
        let preC: (Character | null) = this.charaters[index];
        this.charaters[index] = charater;
        if (charater && 'room' in charater) {
            charater.room = this;
        }
        if (preC instanceof Player && !notKick) {
            let player = preC;
            player.emit('room-info', this.getInfo());
            player.room = null;
        }
        this.emitInfo();
        this.checkRoom();
    }

    emitInfo() {
        this.emit('room-info', this.getInfo());
    }

    getInfo(): RoomInfo {
        return {
            name: this.name,
            maxCount: this.maxCharaterCount,
            host: this.host?this.host.name:"None",
            list: this.getCharaterInfoList(),
            count: this.charaterCount(),
            isIngame: this.game?true:false
        };
    }

    addAudienceToGame(player: Player) {
        if(this.game) {
            this.game.audience.push(player);
            player.game = this.game;
            this.game.emitInfo();
            return true;
        }
        return false;
    }

    emit(event: string, para: any) {
        let flag = true;
        for (let c of this.charaters) {
            if (c && 'emit' in c) {
                (c as Player).emit(event, para);
                if(c==this.host) flag = false;
            }
        }
        if(flag) this.host?.emit(event,para);
    }
}

export default Room;