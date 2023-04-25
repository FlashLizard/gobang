
export interface RoomInfo {
    name: string,
    list: (CharacterInfo | null)[],
    host: string,
    count: number,
    isIngame: boolean,
    maxCount: number,
}

export interface GobangGameInfo {
    gameId: string
    board: number[][]
    historyActions: ([number,number]|null|undefined)[][]
    turn: number
} 

export interface StartInfo {
    view: number,
    gameId: string,
} 

export interface LoginInfo {
    name: string,
}

export interface GameResultInfo {
    player: string | null | undefined,
    desc?:string|null|undefined
}

export interface CharacterInfo {
    name: string,
    ok: boolean,
    type: string,
    other?: number|undefined,
}

export type RequestPara = null | number[][]

export interface ResponseInfo {
    code: boolean,
    desc: string,
    others?: string|null|undefined
}