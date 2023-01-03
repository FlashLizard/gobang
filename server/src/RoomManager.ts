import Room from "./Room";
import {RoomInfo} from "@communication/parameters"
import { logger } from "./ServerLogger";

const ROOM_MANAGER_CODE = {
    EXIST_ROOM: 0,
    CREATE_SUCCESS: 1,

}

interface StringArray<T> {
    [index:string]: T,
}

const roomManager: {
    rooms: StringArray<Room>
    createRoom(name: string): Room
    getRoom(name: string) : Room
    getRoomList(): RoomInfo[]
} = {
    rooms: {},
    createRoom(name: string) {
        logger.info('createRoom ',name);
        return this.rooms[name] = new Room(name);
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