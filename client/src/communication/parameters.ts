export interface RoomInfo {
    name: string,
    list: (CharacterInfo | null)[],
    host: string,
    count: number,
    isIngame: boolean,
    maxCount: number,
}

export interface GobangGameInfo {
    board: number[][]
} 

export interface LoginInfo {
    socketId: string,
    name: string,
}

export interface GameResultInfo {
    winner: string | null | undefined,
}

export interface CharacterInfo {
    name: string,
    ok: boolean,
    type: string,
}

export type RequestPara = null

export interface ResponseInfo {
    code: boolean,
    desc: string,
}