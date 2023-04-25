import React, { Fragment, useContext } from "react";
import Page, { PageContext } from "../Page";
import "../Page.css"
import "./HomePage.css"
import socket, { off, on } from "../../communication/socket";
import NavigateButton from "../../components/NavigateButton";
import navigate from "../../components/GetNavigate";
import { ResponseInfo } from "../../communication/parameters";
import boardcast from "../../tools/broadcast";
import CancelButton from "../../components/cancel/CancelButton";
import { language, languageId } from "src/context/language";
import gobangImg from "../../assets/images/gobang.png"
interface HomePageState {
    showCreateRoomPanel: boolean
    showQuickStartPanel: boolean
    roomName: string,
    game: string | null,
}
class HomePage extends Page<{}, HomePageState> {

    constructor(props: any) {
        super(props)
        this.state = {
            showCreateRoomPanel: false,
            showQuickStartPanel: false,
            roomName: Math.floor(Math.random() * 1000).toString(),
            game: null
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

    renderGameChoosePanel(lan: number) {
        return <div>
            <h4 className="subtitle">{language.chooseGame[lan]}</h4>
            <div className="grid-group">
                <img src={gobangImg}
                    className={this.state.game === 'gobang' ? 'selected' : ''}
                    onClick={() => {
                        if (this.state.game === 'gobang') {
                            this.setState({ game: null })
                        }
                        else this.setState({ game: 'gobang' })
                    }}></img>
            </div></div>
    }

    renderQuickStartPanel(context: PageContext) {
        return (
            <div
                className="backgroundPanel"
            >
                <div
                    className={'panel'}
                >
                    <CancelButton onClick={() => this.setState({ showQuickStartPanel: false, game: null })}></CancelButton>
                    <h3 className="title">{language.quickStart[context.lan]}</h3>
                    {this.renderGameChoosePanel(context.lan)}
                    {this.state.game && <div className="tmpdiv">
                        <h4 className="subtitle">{language.chooseYourTurn[context.lan]}</h4>
                        <div
                            className="buttonGroup"
                        >
                            <this.QuickGameButton turn={0}>{language.first[context.lan]}</this.QuickGameButton>
                            <this.QuickGameButton turn={1}>{language.second[context.lan]}</this.QuickGameButton>
                            <this.QuickGameButton turn={Math.floor(Math.random())}>{language.random[context.lan]}</this.QuickGameButton>
                        </div>
                    </div>}

                </div>
            </div>
        )
    }

    renderCreateRoomPanel(context: PageContext) {
        return (
            <div
                className="backgroundPanel"
            >
                <div
                    className={'panel'}
                >
                    <CancelButton onClick={() => this.setState({ showCreateRoomPanel: false, game: null })}></CancelButton>
                    <h3 className="title">{language.createRoom[context.lan]}</h3>
                    <div>Name:
                        <input
                            onChange={(e) => this.setState({ roomName: e.target.value })}
                            value={this.state.roomName}>
                        </input>
                    </div>
                    {this.renderGameChoosePanel(context.lan)}
                    <div
                        className="buttonGroup"
                    >
                        <button onClick={() => {
                            if (this.state.game) {
                                socket.emitWithLogin('create-room', this.state.roomName);
                            } else {
                                boardcast.alertL(language.pleaseChooseGame);
                            }
                        }}>{language.confirm[context.lan]}</button>
                        <button onClick={() => this.setState({ showCreateRoomPanel: false, game: null })}>{language.cancel[context.lan]}</button>
                    </div>
                </div>
            </div>
        )
    }

    renderPage(context: PageContext): React.ReactNode {
        return (
            <Fragment>
                <h1 className="title">{language.tilte[context.lan]}</h1>
                <div className="homePanel">
                    <div>
                        <button onClick={() => this.setState({ showQuickStartPanel: true })}>{language.quickStart[context.lan]}</button>
                        <button onClick={() => this.setState({ showCreateRoomPanel: true })}>{language.createRoom[context.lan]}</button>
                        <button onClick={() => { navigate('/roomlist') }}>{language.roomList[context.lan]}</button>
                        <button onClick={() => { window.open("https://github.com/FlashLizard/gobang.git"); }}>Github</button>
                    </div>
                </div>
                {this.state.showCreateRoomPanel && this.renderCreateRoomPanel(context)}
                {this.state.showQuickStartPanel && this.renderQuickStartPanel(context)}
            </Fragment>
        )
    }
}

export default HomePage;