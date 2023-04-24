import React from 'react'
import { languageId } from './language';

const GlobalContext = React.createContext(
    {
        lan: languageId.zh,
        setLan: (lan: number) => { }
    } as { lan: number, setLan: (lan: number) => void });

export interface Context {
    globalContext?: {
        lan: number,
        setLan: (lan: number) => void,
    }
}
export default GlobalContext; 