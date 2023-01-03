import React from "react";
import { GameInfo } from "../../communication/parameters";
import SocketContext from "../../communication/socket";
import Page from "../Page";
import "./GamePage.css"
import socket from "../../communication/socket";
import NavigateButton from "../../components/NavigateButton";


interface GamePageState {
    board: number[][];
}

class GamePage extends Page<{},GamePageState> {

    constructor(props: any) {
        super(props)

        let tmp = []
        for(let i=0;i<6;i++) {
            let row = [];
            for(let j=0;j<6;j++) row.push(0);
            tmp.push(row);
        }

        this.state = {
            board: tmp
        }
    }

    componentDidMount(): void {
        console.log("enter game");
        socket.on('game-info',(gameInfo: GameInfo)=>{
            this.setState({board:gameInfo.board});
        })
        socket.emit('get-game-info');
    }

    render(): React.ReactNode {

        return (
            <div>
                <h1>Gobang Game</h1>
                <NavigateButton to='/'>Back To Home</NavigateButton>
                <Board boardInfo={{board:this.state.board}}></Board>
            </div>
        )
    }
}

interface BoardProp {
    boardInfo: GameInfo
}

class Board extends React.Component<BoardProp> {

    constructor(props: BoardProp) {
        super(props)
    }

    onClickSlot(pos: [number, number]) {
        socket.emit('resolve-action-pos', pos );
    }

    render(): React.ReactNode {
        let slots = this.props.boardInfo.board.map((row, i) => {
            return (<tr key={i}>
                {
                    row.map((value, j) => {
                        return value == 0 ? (<td></td>) :
                            (<td key={j} onClick={() => this.onClickSlot([i, j])}>
                                {value == 0 ? " " : (value == 1 ? "⚫" : "⚪")}
                            </td>);
                    })
                }
            </tr>);
        })

        return (
            <table className="board">
                {slots}
            </table>
        )
    }
}

export default GamePage;