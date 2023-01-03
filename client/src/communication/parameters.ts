export interface RoomInfo {
    name: string,
    count: number,
    isIngame: boolean,
    maxCount: number,
}

export interface GameInfo {
    board: number[][]
} 

export interface LoginInfo {
    socketId: string,
    name: string,
}

export interface GameResultInfo {
    winner: string | null,
}

export type RequestPara = null