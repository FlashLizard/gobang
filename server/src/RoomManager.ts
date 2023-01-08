import Room from "./Room";
import {RoomInfo} from "@communication/parameters"
import { logger } from "./tools/ServerLogger";
import Player from "./Player";

const roomManager: {
    rooms: Map<string,Room>
    createRoom(name: string,host: Player): Room
    getRoom(name: string) : Room|undefined
    getRoomList(): RoomInfo[]
    removeRoom(room: string|Room):boolean
} = {
    rooms: new Map(),
    createRoom(name: string, host: Player) {
        logger.info('createRoom ',name);
        let room = new Room(name,host)
        this.rooms.set(name, room);
        return room;
    },
    getRoom(name: string) {
        return this.rooms.get(name);
    },
    getRoomList() {
        let result: RoomInfo[] = []
        for(let r of this.rooms.values()) {
            result.push(r.getInfo());
        }
        return result;
    },
    removeRoom(room) {
        if(room instanceof Room) {
            for(let i of this.rooms.keys()) {
                if(this.rooms.get(i)==room) {
                    return this.rooms.delete(i);
                }
            }
            return false;
        }
        else {
            return this.rooms.delete(room);
        }
    },
};

export default roomManager;