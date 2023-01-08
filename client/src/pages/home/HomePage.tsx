import React, { useContext } from "react";
import Page from "../Page";
import "../Page.css"
import "./HomePage.css"
import socket, { off, on } from "../../communication/socket";
import NavigateButton from "../../components/NavigateButton";
import navigate from "../../components/GetNavigate";
import { ResponseInfo } from "../../communication/parameters";
import boardcast from "../../tools/broadcast";
import CancelButton from "../../components/cancel/CancelButton";
interface HomePageState {
    showCreateRoomPanel: boolean
    showQuickStartPanel: boolean
    roomName: string,
}

class HomePage extends Page<{}, HomePageState> {

    constructor(props: any) {
        super(props)
        this.state = {
            showCreateRoomPanel: false,
            showQuickStartPanel: false,
            roomName: Math.floor(Math.random() * 1000).toString(),
        }
    }

    componentDidMount(): void {
        socket.emitWithLogin('exit-room');
        on(this, 'response-create-room', (para: ResponseInfo) => {
            boardcast.alert(para.desc);
        });
        on(this, 'response-join-room', (para: ResponseInfo) => {
            boardcast.alert(para.desc);
            if (para.code) {
                navigate('/room');
            }
        })
    }

    componentWillUnmount(): void {
        off(this);
    }

    QuickGameButton(props: { turn: number, children?: any }) {
        return (
            <NavigateButton to='/game' onClick={() =>
                socket.emitWithLogin('quick-game', props.turn)}
            > {props.children}</NavigateButton >
        )
    }

    renderQuickStartPanel() {
        return (
            <div
                className="backgroundPanel"
            >
                <div
                    className={'panel'}
                >
                    <CancelButton onClick={() => this.setState({ showQuickStartPanel: false })}></CancelButton>
                    <h3 className="title">Choose Your Turn</h3>
                    <div
                        className="buttonGroup"
                    >
                        <this.QuickGameButton turn={0}>First</this.QuickGameButton>
                        <this.QuickGameButton turn={1}>Second</this.QuickGameButton>
                        <this.QuickGameButton turn={Math.floor(Math.random())}>Random</this.QuickGameButton>
                    </div>
                </div>
            </div>
        )
    }

    renderCreateRoomPanel() {
        return (
            <div
                className="backgroundPanel"
            >
                <div
                    className={'panel'}
                >
                    <CancelButton onClick={() => this.setState({ showCreateRoomPanel: false })}></CancelButton>
                    <h3 className="title">Create Room</h3>
                    <div>Name:
                        <input
                            onChange={(e) => this.setState({ roomName: e.target.value })}
                            value={this.state.roomName}>
                        </input>
                    </div>
                    <div
                        className="buttonGroup"
                    >
                        <button onClick={() => {
                            socket.emitWithLogin('create-room', this.state.roomName);
                        }}>Create</button>
                        <button onClick={() => this.setState({ showCreateRoomPanel: false })}>Cancel</button>
                    </div>
                </div>
            </div>
        )
    }

    render(): React.ReactNode {
        return (
            <div>

                <h1 className="title">Gobang Game</h1>
                <div className="homePanel">
                    <div>
                        <button onClick={() => this.setState({ showQuickStartPanel: true })}>Quick Start</button>
                        <button onClick={() => this.setState({ showCreateRoomPanel: true })}>Create Room</button>
                        <button onClick={() => { navigate('/roomlist') }}>Room List</button>
                        <button onClick={() => { window.open("https://github.com/FlashLizard/gobang.git"); }}>Github</button>
                    </div>
                </div>
                {this.state.showCreateRoomPanel && this.renderCreateRoomPanel()}
                {this.state.showQuickStartPanel && this.renderQuickStartPanel()}
            </div>
        )
    }
}

export default HomePage;