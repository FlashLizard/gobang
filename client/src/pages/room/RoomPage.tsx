import React from "react";
import Page from "../Page";
import "../Page.css"
import socket, { off, on } from "../../communication/socket";
import './RoomPage.css'
import GlobalContext from "../../context/Context";
import { CharacterInfo, ResponseInfo, RoomInfo } from "../../communication/parameters";
import navigate from "../../components/GetNavigate";
import boardcast from "../../tools/broadcast";
import { nowName } from "../../components/login/Login";
import { loginCheck } from "../../components/login/Login";
import { Parser } from "acorn";
interface RoomPageState {
    ok: boolean,
    roomName: string,
    list: (CharacterInfo | null)[],
    host: string,
}

class RoomPage extends Page<{}, RoomPageState> {
    toGame: boolean

    constructor(props: any) {
        super(props)
        this.state = {
            ok: false,
            roomName: "None",
            list: [null, null],
            host: "None",
        }
        this.toGame = false;
        this.changeOk = this.changeOk.bind(this);
    }

    componentDidMount(): void {
        loginCheck();
        console.log('enter room');
        this.toGame = false;
        on(this, 'room-info', (para: RoomInfo) => {
            console.log('room-info', para);
            if (para == null) {
                boardcast.alert('The room does not exist');
                navigate('/')
                return;
            }
            let list = para.list;
            let flag = true;
            for (let c of list) {
                if (c && c.name == nowName) {
                    flag = false;
                    break;
                }
            }
            if (flag && para.host != nowName) {
                boardcast.alert('You are kicked out!');
                navigate('/');
            }
            this.setState({ roomName: para.name, list: list, host: para.host })
        });
        on(this, 'response-start-game', (para: ResponseInfo) => {
            console.log('response-start-game', para);
            boardcast.alert(para.desc);
            if (para.code) {
                this.toGame = true;
                navigate('/game');
            }
        });
        setTimeout(() => socket.emitWithLogin('get-room-info'), 100);
    }

    componentWillUnmount(): void {
        off(this);
        if (!this.toGame) {
            socket.emitWithLogin('exit-room');
        }
    }

    changeOk() {
        socket.emit('change-ok', !this.state.ok);
        this.setState({ ok: !this.state.ok });
    }

    typeButton(type: string | null | undefined, pName: string | null | undefined, index: number) {
        let btn;
        if (this.state.host != nowName) {
            if (!type || type == 'Player') {
                btn = <div>🧒</div>
            }
            else {
                btn = <div>💻</div>
            }
        } else {
            if (type) {
                if (type == 'Player') {
                    btn = <button className="type" onClick={() => {
                        if (this.state.host != pName) socket.emitWithLogin('kick-player', index);
                        socket.emitWithLogin('change-character-type', index);
                    }}>🧒</button>
                }
                else {
                    btn = <button className="type" onClick={() => {
                        socket.emitWithLogin('change-character-type', index);
                    }}>💻</button>
                }
            }
            else {
                btn = <button className="type" onClick={() => {
                    socket.emitWithLogin('change-character-type', index);
                }}>🧒</button>
            }
        }
        return btn;
    }

    operateButton(type: string | null | undefined, index: number) {
        let btn;
        if (this.state.host != nowName) return null;
        if (type) {
            if (type == 'Player') {
                btn = <button onClick={() => socket.emitWithLogin('kick-player', index)}>Kick Out</button>
            }
            else {
                btn = <button onClick={() => socket.emitWithLogin('change-pc-type', index)}>Change PC</button>
            }
        }
        else {
            btn = <button onClick={() => {
                socket.emitWithLogin('change-turn', index);
            }}>Set Mine</button>
        }
        return btn;
    }

    render(): React.ReactNode {
        let list = this.state.list.map((value, i) => {
            return (
                <tr key={i}>
                    <td>{i}</td>
                    <td className="td2">{value ? value.name : '⌛'}</td>
                    <td>{!value ? '⌛' : (value.ok ? '✔' : '❌')}</td>
                    <td>
                        {this.typeButton(value?.type, value?.name, i)}
                    </td>
                    <td className="td5">
                        {this.operateButton(value?.type, i)}
                    </td>
                </tr>
            )
        })
        return (
            <div className="wrapper roomPanel">
                <div className="title">Gobang Game</div>
                <div className="horizontalWrapper">
                    <div>{`Room: ${this.state.roomName}`}</div>
                    <div>{`Host: ${this.state.host}`}</div>
                </div>
                <div className="horizontalWrapper">
                    <button onClick={() => navigate('/')}>Back</button>
                    {
                        nowName == this.state.host ?
                            <button onClick={() => socket.emitWithLogin('start-game')}>Start</button> :
                            <button onClick={this.changeOk} className={this.state.ok ? 'ok' : 'preparing'}>
                                {this.state.ok ? 'Ok' : 'Prepare'}
                            </button>

                    }
                    <button onClick={() => socket.emitWithLogin('get-room-info')}>Fresh</button>
                </div>
                <table className='room'>
                    <thead>
                        <tr>
                            <th id='th1'>序号</th>
                            <th id='th2'>名称</th>
                            <th id='th3'>状态</th>
                            <th id='th4'>类型</th>
                            <th id='th5'>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list}
                    </tbody>
                </table>
            </div>
        )
    }
}

export default RoomPage;