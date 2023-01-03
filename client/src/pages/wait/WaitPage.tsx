import React from "react";
import Page from "../Page";
import "./HomePage.css"
import socket from "../../communication/socket";
import NavigateButton from "../../components/NavigateButton";
interface WaitPageState {
    showCreateRoomPanel: boolean
    showQuickStartPanel: boolean
}

class WaitPage extends Page<{}, WaitPageState> {

    constructor(props: any) {
        super(props)
        this.state = {
            showCreateRoomPanel: false,
            showQuickStartPanel: false
        }
    }

    QuickGameButton(props: { turn: number, children?: any }) {
        return (
            <NavigateButton to='/game' onClick={() =>
                socket.emit('quick-game', props.turn)}
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
                    <div className="cancel" onClick={() => this.setState({ showQuickStartPanel: false })}></div>
                    <h3>Choose Your Turn</h3>
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
                    <div className="cancel" onClick={() => this.setState({ showCreateRoomPanel: false })}></div>
                    <h3>Create Room</h3>
                    <div> Name: <input></input></div>
                    <div
                        className="buttonGroup"
                    >
                        <button>Create</button>
                        <button onClick={() => this.setState({ showCreateRoomPanel: false })}>Cancel</button>
                    </div>
                </div>
            </div>
        )
    }

    render(): React.ReactNode {
        return (
            <div>
                <h1>Gobang Game</h1>
                <button onClick={() => this.setState({ showQuickStartPanel: true })}>Quick Start</button>
                <button onClick={() => this.setState({ showCreateRoomPanel: true })}>Create Room</button>
                <NavigateButton to='/roomlist'>Room List</NavigateButton>
                {this.state.showCreateRoomPanel && this.renderCreateRoomPanel()}
                {this.state.showQuickStartPanel && this.renderQuickStartPanel()}
            </div>
        )
    }
}

export default WaitPage;