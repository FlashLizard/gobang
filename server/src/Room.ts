import Character from "./Player";

class Room{
    name: string
    players: Character[] = []
    maxPlayerCount: number

    constructor(name: string, players?: Character[], maxPlayerCount: number = 10) {
        this.name = name;
        if(players) {
            this.players = this.players.concat(players);
        }
        this.maxPlayerCount = maxPlayerCount;
    }

    playerCount(): number {
        return this.players.length;
    }
}

export default Room;