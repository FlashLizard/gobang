import Room from "./Room";
import {RoomInfo} from "@communication/parameters"
import { logger } from "./tools/ServerLogger";

interface StringArray<T> {
    [index:string]: T,
}

const roomManager: {
    rooms: StringArray<Room>
    createRoom(name: string,host: string): Room
    getRoom(name: string) : Room
    getRoomList(): RoomInfo[]
} = {
    rooms: {},
    createRoom(name: string, host: string) {
        logger.info('createRoom ',name);
        return this.rooms[name] = new Room(name,host);
    },
    getRoom(name: string) {
        return this.rooms[name];
    },
    getRoomList() {
        let result: RoomInfo[] = []
        for(let i in this.rooms) {
            result.push(this.rooms[i].getInfo());
        }
        return result;
    },
};

export default roomManager;