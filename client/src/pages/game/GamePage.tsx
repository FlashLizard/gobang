import React from "react";
import { GameResultInfo, GobangGameInfo } from "../../communication/parameters";
import SocketContext, { off, on } from "../../communication/socket";
import Page from "../Page";
import '../Page.css'
import './GamePage.css'
import socket from "../../communication/socket";
import NavigateButton from "../../components/NavigateButton";
import navigate from "../../components/GetNavigate";
import { boardSize } from '../../communication/settings'
import boardcast from "../../tools/broadcast";
import { loginCheck } from "../../components/login/Login";
import CancelButton from "../../components/cancel/CancelButton";

let canAction: boolean = false;

interface GamePageState {
    board: number[][]
    restTime: number | null
    showGameEndPanel: boolean
    result: GameResultInfo | null
}

class GamePage extends Page<{}, GamePageState> {

    constructor(props: any) {
        super(props)

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
        }
    }

    componentDidMount(): void {
        loginCheck();
        console.log("enter game");
        canAction = false;
        on(this, 'game-info', (gameInfo: GobangGameInfo) => {
            console.log('game-info', gameInfo);
            if (gameInfo == null) {
                boardcast.alert('You are not in a game');
                navigate('/');
                return;
            }
            this.setState({ board: gameInfo.board });
        });
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

    gameEndPanel() {
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
                    <h3 className="title">Game End</h3>
                    <h4>{!result.player ? `No Winner` : `${result.player} is Winner`}</h4>
                    <div
                        className="buttonGroup"
                    >
                        <button onClick={() => {
                            navigate('/');
                        }}>Back To Home</button>
                        <button onClick={() => {
                            navigate('/room');
                        }}>Return Room</button>
                    </div>
                </div>
            </div>
        )
    }

    render(): React.ReactNode {

        return (
            <div>
                {this.state.showGameEndPanel && this.gameEndPanel()}
                <div className="gamePanel">
                    <div className="title">Gobang Game</div>
                    {this.state.restTime ?
                        <div>{`Your Turn: ${this.state.restTime} seconds rest`}</div> :
                        <div>{`Others' Turn`}</div>
                    }
                    <NavigateButton to='/'>Back To Home</NavigateButton>
                    <Board boardInfo={{ board: this.state.board }}></Board>
                </div>
            </div>
        )
    }
}

interface BoardProp {
    boardInfo: GobangGameInfo
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
        let slots = this.props.boardInfo.board.map((row, i) => {
            return (<tr key={i}>
                {
                    row.map((value, j) => {
                        return value == -1 ?
                            (<td key={j} onClick={() => this.onClickSlot([i, j])}></td>) :
                            (<td key={j}>
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