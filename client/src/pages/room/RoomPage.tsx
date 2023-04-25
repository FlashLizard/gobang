import React from "react";
import Page, { PageContext } from "../Page";
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
import { aiDesc, aiPara } from "src/communication/settings";
import { language } from "src/context/language";
import { Fragment } from "react";
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
                boardcast.alertL(language.noRoom);
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
                boardcast.alertL(language.beKicked);
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

    operateButton(type: string | null | undefined, index: number, lan: number, other?: number) {
        let btn;
        if (this.state.host != nowName) return null;


        if (type) {
            if (type == 'Player') {
                btn = <button onClick={() => socket.emitWithLogin('kick-player', index)}>{language.kickOut[lan]}</button>
            }
            else {
                btn = <button onClick={() => socket.emitWithLogin('change-pc-type',
                    { index: index, type: ((other as number) + 1) % aiPara.length })}>{aiDesc[other as number]}</button>
            }
        }
        else {
            btn = <button onClick={() => {
                socket.emitWithLogin('change-turn', index);
            }}>{language.chooseSlot[lan]}</button>
        }
        return btn;
    }

    renderPage(context: PageContext): React.ReactNode {
        let list = this.state.list.map((value, i) => {
            return (
                <Fragment>
                    <td>{i}</td>
                    <td className="td2">{value ? value.name : '⌛'}</td>
                    <td>{!value ? '⌛' : (value.ok ? '✔' : '❌')}</td>
                    <td>
                        {this.typeButton(value?.type, value?.name, i)}
                    </td>
                    <td className="td5">
                        {this.operateButton(value?.type, i, context.lan, value?.other)}
                    </td></Fragment>
            )
        })
        return (
            <Fragment>
                <h1 className="title">{language.gobang[context.lan]}</h1>
                <div className="room-panel">
                    <div className="horizontalWrapper">
                        <div>{`${language.room[context.lan]}: ${this.state.roomName}`}</div>
                        <div>{`${language.host[context.lan]}: ${this.state.host}`}</div>
                    </div>
                    <div className="room-top-panel">
                        <div className="horizontalWrapper">
                            <button onClick={() => navigate('/')}>{language.backToHome[context.lan]}</button>
                            {
                                nowName == this.state.host ?
                                    <button onClick={() => socket.emitWithLogin('start-game')}>{language.start[context.lan]}</button> :
                                    <button onClick={this.changeOk} className={this.state.ok ? 'ok' : 'preparing'}>
                                        {this.state.ok ? 'Ok' : 'Prepare'}
                                    </button>

                            }
                            <button onClick={() => socket.emitWithLogin('get-room-info')}>{language.fresh[context.lan]}</button>
                        </div>
                            <table className='room'>
                                        <th id='th1'>{language.number[context.lan]}</th>
                                        <th id='th2'>{language.name[context.lan]}</th>
                                        <th id='th3'>{language.status[context.lan]}</th>
                                        <th id='th4'>{language.type[context.lan]}</th>
                                        <th id='th5'>{language.operate[context.lan]}</th>
                                    {list}
                            </table>
                        </div>
                </div>
            </Fragment>
        )
    }
}

export default RoomPage;