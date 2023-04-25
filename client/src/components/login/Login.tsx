import React from 'react';
import socket from '../../communication/socket';
import { ResponseInfo } from '../../communication/parameters';
import boardcast from '../../tools/broadcast';
import navigate from '../GetNavigate';
import './Login.css'
import '../../pages/Page.css'
import CancelButton from '../cancel/CancelButton';
import { language } from 'src/context/language';
import GlobalContext from 'src/context/Context';

interface LoginState {
    name: string | null | undefined,
    showLoginPanel: boolean,
    inputName: string,
}

export let nowName: string | undefined | null

export function loginCheck() {
    if (!nowName) {
        boardcast.alert(language.pleaseLogin[theLan]);
        navigate('/');
    }
}

let theLan = 0;

class Login extends React.Component<any, LoginState> {

    constructor(props: any) {
        super(props);
        let name = nowName = this.getRandomName();
        this.state = {
            name: name,
            showLoginPanel: false,
            inputName: name,
        }
    }

    getRandomName(): string {
        return "游客" + Math.floor((Math.random() * 100000000)).toString();
    }

    componentDidMount(): void {
        socket.on('connect', () => {
            console.log(`${socket.id} connected `);
            socket.emit("login", { name: this.state.name, socketId: socket.id })
        })
        socket.on('response-login', (para: ResponseInfo) => {
            boardcast.alert(para.desc);
            if (para.code) {
                nowName = para.others;
                this.setState({ name: para.others, inputName: para.others ?? "", showLoginPanel: false });
                if (!nowName) console.log(para.others, typeof para.others);
            }
        })
    }

    loginPanel(lan: number) {
        return (
            <div
                className="backgroundPanel"
            >
                <div
                    className={'panel'}
                >
                    <h2 className='title'>{language.login[lan]}</h2>
                    <CancelButton onClick={() => this.setState({ showLoginPanel: false })}></CancelButton>
                    <div> Name:
                        <input
                            onChange={(e) => this.setState({ inputName: e.target.value })}
                            value={this.state.inputName}>
                        </input>
                    </div>
                    <div
                        id="login-button-group"
                    >
                        <button id="login" onClick={() => socket.emit('login', { name: this.state.inputName })}>{language.confirm[lan]}</button>
                        <button id="cancel" onClick={() => this.setState({ showLoginPanel: false })}>{language.cancel[lan]}</button>
                        <button id="guest" onClick={() => socket.emit('login', { name: this.getRandomName() })}>{language.guestLogin[lan]}</button>
                    </div>
                </div>
            </div>
        )
    }

    render(): React.ReactNode {
        return (
            <GlobalContext.Consumer>
                {(context) => {
                    theLan = context.lan;
                    let loginbar;
                    if (this.state.name) {
                        loginbar = (
                            <div className="login-bar">
                                <div className='name'>
                                    {this.state.name}
                                </div>
                                <button onClick={() => socket.emitWithLogin('login-out')}>{language.loginOut[context.lan]}</button>
                            </div>
                        )
                    }
                    else {
                        loginbar = <div className="login-bar">
                            <button className='loginbutton' onClick={() => {
                                this.setState({ showLoginPanel: true });
                            }}>{language.login[context.lan]}</button>
                        </div>
                    }
                    return (

                        <div>
                            {loginbar}
                            {this.state.showLoginPanel && this.loginPanel(context.lan)}
                        </div>
                    )
                }}
            </GlobalContext.Consumer>
        );
    }
}

export default Login;
