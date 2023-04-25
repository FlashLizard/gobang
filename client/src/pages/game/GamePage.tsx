import React, { Fragment } from "react";
import { GameResultInfo, GobangGameInfo, StartInfo } from "../../communication/parameters";
import SocketContext, { off, on } from "../../communication/socket";
import Page, { PageContext } from "../Page";
import '../Page.css'
import './GamePage.css'
import socket from "../../communication/socket";
import NavigateButton from "../../components/NavigateButton";
import navigate from "../../components/GetNavigate";
import { boardSize } from '../../communication/settings'
import boardcast from "../../tools/broadcast";
import { loginCheck } from "../../components/login/Login";
import CancelButton from "../../components/cancel/CancelButton";
import { language } from "src/context/language";

let canAction: boolean = false;
let view: number | undefined

interface GamePageState {
    board: number[][]
    recent: [number, number] | undefined | null
    restTime: number | null
    showGameEndPanel: boolean
    result: GameResultInfo | null
    gameId: string | null
}

class GamePage extends Page<{}, GamePageState> {

    
    constructor(props: any) {
        super(props)

        this.fresh();
    }

    fresh() {
        let tmp = []
        for (let i = 0; i < boardSize; i++) {
            let row = [];
            for (let j = 0; j < boardSize; j++) row.push(-1);
            tmp.push(row);
        }
        this.state = {
            board: tmp,
            restTime: null,
            showGameEndPanel: false,
            result: null,
            recent: null,
            gameId: null,
        }
        this.setState({});
    }

    componentDidMount(): void {
        loginCheck();
        console.log("enter game");
        canAction = false;
        this.fresh();
        on(this, 'game-info', (gameInfo: GobangGameInfo) => {
            if(this.state.gameId && this.state.gameId !== gameInfo.gameId) return; 
            console.log('game-info', gameInfo);
            this.setState({gameId:gameInfo.gameId});
            if (gameInfo == null) {
                boardcast.alertL(language.notInGame);
                navigate('/');
                return;
            }
            this.setState({ board: gameInfo.board, recent: typeof gameInfo.turn == 'number' ? gameInfo.historyActions[gameInfo.turn].pop() : null });
        });
        on(this, 'start-info', (para: StartInfo) => {
            this.setState({gameId:para.gameId})
            view = para.view;
        })
        on(this, 'rest-time', (para: number) => {
            this.setState({ restTime: para });
        });
        on(this, 'action-finished', () => {
            this.setState({ restTime: null });
        });
        on(this, 'time-out', () => {
            this.setState({ restTime: null });
        });
        on(this, 'game-end', (para: GameResultInfo) => {
            console.log('game-end', para);
            this.setState({ showGameEndPanel: true, result: para });
        });
        on(this, 'action-pos', () => {
            canAction = true;
        })
        setTimeout(() => socket.emitWithLogin('get-game-info'), 100);
    }

    componentWillUnmount(): void {
        socket.emitWithLogin('resolve-abort');
        off(this);
    }

    gameEndPanel(lan: number) {
        let result = this.state.result;
        if (!result) return null;
        return (
            <div
                className="backgroundPanel"
            >
                <div
                    className={'panel'}
                >
                    <CancelButton onClick={() => this.setState({ showGameEndPanel: false })}></CancelButton>
                    <h3 className="title">{language.gameEnd[lan]}</h3>
                    <h4>{!result.player ? language.noWinner[lan] : result.player + language.winner[lan]}</h4>
                    <div
                        className="buttonGroup"
                    >
                        <button onClick={() => {
                            navigate('/');
                        }}>{language.backToHome[lan]}</button>
                        <button onClick={() => {
                            navigate('/room');
                        }}>{language.returnRoom[lan]}</button>
                    </div>
                </div>
            </div>
        )
    }

    renderPage(context: PageContext): React.ReactNode {

        return (
            <Fragment>
                {this.state.showGameEndPanel && this.gameEndPanel(context.lan)}
                <h1 className="title">{language.gobang[context.lan]}</h1>
                <div className="game-panel">
                    {this.state.restTime ?
                        <div>{language.yourTurn[context.lan] + language.restTime[context.lan](this.state.restTime)}</div> :
                        <div>{language.opponentTurn[context.lan]}</div>
                    }
                    <div className="inner-panel">
                        <NavigateButton to='/'>{language.backToHome[context.lan]}</NavigateButton>
                        <Board board={this.state.board} recent={this.state.recent}></Board></div>
                </div>
            </Fragment>
        )
    }
}

interface BoardProp {
    board: number[][],
    recent: [number, number] | null | undefined,
}

class Board extends React.Component<BoardProp> {

    constructor(props: BoardProp) {
        super(props)
    }

    onClickSlot(pos: [number, number]) {
        if (canAction) {
            socket.emitWithLogin('resolve-action-pos', pos);
            canAction = false;
        }
    }

    render(): React.ReactNode {
        let slots = this.props.board.map((row, i) => {
            return (<tr key={i}>
                {
                    row.map((value, j) => {
                        return value == -1 ?
                            (<td key={j} onClick={() => this.onClickSlot([i, j])}></td>) :
                            (<td key={j} className={this.props.recent && i == this.props.recent[0] &&
                                j == this.props.recent[1] ? "recent" : ""}>
                                {value == -1 ? " " : (value == 0 ? "⚫" : "⚪")}
                            </td>);
                    })
                }
            </tr>);
        })

        return (
            <table className="board">
                <tbody>
                    {slots}
                </tbody>
            </table>
        )
    }
}

export default GamePage;