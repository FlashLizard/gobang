import { RequestPara } from "@root/client/src/communication/parameters";

interface Character {
    name: string

    on: (event: string, callback: (...args: any[]) => any) => any;
    request: (event: string, para?: RequestPara, time?: number) => Promise<any>;

}

export default Character;