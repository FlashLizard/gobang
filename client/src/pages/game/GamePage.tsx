import React from "react";
import { GameResultInfo, GobangGameInfo } from "../../communication/parameters";
import SocketContext, { off, on } from "../../communication/socket";
import Page from "../Page";
import '../Page.css'
import './GamePage.css'
import socket from "../../communication/socket";
import NavigateButton from "../../components/NavigateButton";
import navigate from "../../components/GetNavigate";


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
        for (let i = 0; i < 6; i++) {
            let row = [];
            for (let j = 0; j < 6; j++) row.push(0);
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
        console.log("enter game");
        on(this,'game-info', (gameInfo: GobangGameInfo) => {
            console.log('game-info', gameInfo);
            this.setState({ board: gameInfo.board });
        });
        on(this,'rest-time', (para: number) => {
            this.setState({ restTime: para });
        });
        on(this,'action-finished', () => {
            this.setState({ restTime: null });
        });
        on(this,'time-out', () => {
            this.setState({ restTime: null });
        });
        on(this,'game-end', (para: GameResultInfo) => {
            console.log('game-end', para);
            this.setState({ showGameEndPanel: true, result: para });
        });
        socket.emit('get-game-info');
    }

    componentWillUnmount(): void {
        socket.emit('resolve-abort');
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
                    <div className="cancel" onClick={() => this.setState({ showGameEndPanel: false })}></div>
                    <h3>Game End</h3>
                    <h4>{!result.winner ? `No Winner` : `${result.winner} is Winner`}</h4>
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
                <h1>Gobang Game</h1>
                {this.state.restTime ?
                    <h2>{`Your Turn: ${this.state.restTime} seconds rest`}</h2> :
                    <h2>{`Others' Turn`}</h2>
                }
                <NavigateButton to='/'>Back To Home</NavigateButton>
                <Board boardInfo={{ board: this.state.board }}></Board>
                {this.state.showGameEndPanel && this.gameEndPanel()}
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
        socket.emit('resolve-action-pos', pos);
    }

    render(): React.ReactNode {
        let slots = this.props.boardInfo.board.map((row, i) => {
            return (<tr key={i}>
                {
                    row.map((value, j) => {
                        return value == 0 ?
                            (<td key={j} onClick={() => this.onClickSlot([i, j])}></td>) :
                            (<td key={j}>
                                {value == 0 ? " " : (value == 1 ? "⚫" : "⚪")}
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