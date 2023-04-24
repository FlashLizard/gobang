import React from 'react';
import GlobalContext from 'src/context/Context';
import { language, languageId } from 'src/context/language';
import './LanSelector.css'


export class LanSelector extends React.Component {
    constructor(props: any) {
        super(props);
    }
    render(): React.ReactNode {
        return (
            <GlobalContext.Consumer>
                {(context) => (
                    <div className="language-bar">
                        <span>{language.language[context.lan]}</span>
                        <div className="language-content">
                            {language.lan.map((v,i) => (
                                <div className='select-button' onClick={()=>context.setLan(i)}>
                                    {v}
                                </div>
                            ))}
                        </div>
                    </div>)
                }
            </GlobalContext.Consumer>)
    }
}