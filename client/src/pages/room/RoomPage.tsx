import React from "react";
import Page from "../Page";
import socket, { off, on } from "../../communication/socket";
import './RoomPage.css'
import GlobalContext from "../../context/Context";
import { CharacterInfo, ResponseInfo, RoomInfo } from "../../communication/parameters";
import navigate from "../../components/GetNavigate";
interface RoomPageState {
    ok: boolean,
    roomName: string,
    list: (CharacterInfo | null)[],
    host: string,
}

class RoomPage extends Page<{}, RoomPageState> {
    playerName: string | null
    toGame: boolean

    constructor(props: any) {
        super(props)
        this.state = {
            ok: false,
            roomName: "None",
            list: [null, null],
            host: "None",
        }
        this.playerName = null;
        this.toGame = false;
        this.changeOk = this.changeOk.bind(this);
    }

    componentDidMount(): void {
        console.log('enter room');
        this.toGame = false;
        on(this,'room-info', (para: RoomInfo) => {
            console.log('room-info', para);
            let list = para.list;
            let flag = true;
            for(let c of list) {
                if(c && c.name == this.playerName) {
                    flag = false;
                    break;
                }
            }
            if(flag) {
                alert('You are kicked out!');
                navigate('/');
            }
            this.setState({ roomName: para.name, list: list, host: para.host })
        });
        on(this,'response-start-game', (para: ResponseInfo) => {
            console.log('response-start-game', para);
            alert(para.desc);
            if (para.code) {
                this.toGame = true;
                navigate('/game');
            }
        });
        socket.emit('get-room-info');
    }

    componentWillUnmount(): void {
        off(this);
        if(!this.toGame)
        {
            socket.emit('exit-room');
        }
    }

    changeOk() {
        socket.emit('change-ok', !this.state.ok);
        this.setState({ ok: !this.state.ok });
    }

    render(): React.ReactNode {
        let list = this.state.list.map((value, i) => {
            return (
                <tr key={i}>
                    <td>{i}</td>
                    <td>{value ? value.name : 'Wait'}</td>
                    <td>{!value ? 'Wait' : (value.ok ? 'Ok' : 'Preparing')}</td>
                    <td>{value ? value.type : 'Player'}</td>
                    <td>
                        {this.playerName == this.state.host &&
                            (value && value.type == 'Player' ?
                                <button onClick={() => socket.emit('kick-player', i)}>Kick Out</button> :
                                <button onClick={() => socket.emit('change-charater-type', i)}>Change Type</button>
                            )
                        }
                    </td>
                </tr>
            )
        })
        return (
            <div>
                <GlobalContext.Consumer>
                    {({ name }) => {
                        if (this.playerName != name) {
                            console.log(name);
                            this.playerName = name;
                        };
                        return null;
                    }}
                </GlobalContext.Consumer>
                <h1>{`Room: ${this.state.roomName}`}</h1>
                <h2>{`Host: ${this.state.host}`}</h2>
                <button onClick={()=>navigate('/')}>Back To Home</button>
                {
                    this.playerName == this.state.host ?
                        <button onClick={() => socket.emit('start-game')}>Start Game</button> :
                        <button onClick={this.changeOk} className={this.state.ok ? 'ok' : 'preparing'}>
                            {this.state.ok ? 'Ok' : 'Preparing'}
                        </button>

                }
                <button onClick={() => socket.emit('get-room-info')}>Fresh</button>
                <table className='room'>
                    <thead>
                        <tr>
                            <th>序号</th>
                            <th>名称</th>
                            <th>状态</th>
                            <th>类型</th>
                            <th>操作</th>
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