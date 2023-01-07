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
}

export type RequestPara = null | number[][]

export interface ResponseInfo {
    code: boolean,
    desc: string,
    others?: string|null|undefined
}