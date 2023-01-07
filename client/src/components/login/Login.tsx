import React from 'react';
import socket from '../../communication/socket';
import { ResponseInfo } from '../../communication/parameters';
import boardcast from '../../tools/broadcast';
import navigate from '../GetNavigate';
import './Login.css'
import '../../pages/Page.css'
import CancelButton from '../cancel/CancelButton';

interface LoginState {
    name: string | null | undefined,
    showLoginPanel: boolean,
    inputName: string,
}

export let nowName: string | undefined | null

export function loginCheck() {
    if(!nowName) {
        boardcast.alert('Please Login First');
        navigate('/');
    }
}

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
                if(!nowName) console.log(para.others,typeof para.others);
            }
        })
    }

    loginPanel() {
        return (
            <div
                className="backgroundPanel"
            >
                <div
                    className={'panel'}
                >
                    <h1 className='title'>Login</h1>
                    <CancelButton onClick={() => this.setState({ showLoginPanel: false })}></CancelButton>
                    <div> Name:
                        <input
                            onChange={(e) => this.setState({ inputName: e.target.value })}
                            value={this.state.inputName}>
                        </input>
                    </div>
                    <div
                        className="buttonGroup"
                    >
                        <button onClick={() => socket.emit('login', { name: this.state.inputName })}>Confirm</button>
                        <button onClick={() => this.setState({ showLoginPanel: false })}>Cancel</button>
                        <br></br>
                        <button onClick={() => socket.emit('login', { name: this.getRandomName() })}>游客登陆</button>
                    </div>
                </div>
            </div>
        )
    }

    render(): React.ReactNode {
        let loginbar;
        if(this.state.name) {
            loginbar = (
                <div className="loginbar">
                    <div className='name'>
                        {this.state.name}
                    </div>
                    <button onClick={()=>socket.emitWithLogin('login-out')}>Login Out</button>
                </div>
            )
        }
        else {
            loginbar = <div className="loginbar">
                <button className='loginbutton' onClick={() => {
                    this.setState({ showLoginPanel: true });
                }}>Login</button>
            </div>
        }
        return (
            <div>
                {loginbar}
                {this.state.showLoginPanel && this.loginPanel()}
            </div>
        );
    }
}

export default Login;
