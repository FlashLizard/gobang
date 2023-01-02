import Room from "./Room";
import Character,{Player} from "./Character";

const ROOM_MANAGER_CODE = {
    EXIST_ROOM: 0,
    CREATE_SUCCESS: 1,

}

const roomManager: {
    rooms: {[key:string]:Room}
    createRoom(name: string): void
    getRoom(name: string) : Room
} = {
    rooms: {},
    createRoom(name: string) {
        this.rooms[name] = new Room(name);
    },
    getRoom(name: string) {
        return this.rooms[name];
    }
};

export default roomManager;