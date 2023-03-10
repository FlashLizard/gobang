import React, { useContext } from "react";
import Page from "../Page";
import './RoomListPage.css'
import { ResponseInfo, RoomInfo } from "../../communication/parameters";
import socket, { off, on } from "../../communication/socket";
import NavigateButton from "../../components/NavigateButton";
import navigate from "../../components/GetNavigate";
import boardcast from "../../tools/broadcast";

interface RoomListPageState {
    roomList: RoomInfo[]
}

class RoomListPage extends Page<{}, RoomListPageState> {

    constructor(props: any) {
        super(props)
        this.state = {
            roomList: []
        }
    }

    componentDidMount(): void {

        on(this, 'room-list', (para: RoomInfo[]) => {
            this.setState({ roomList: para });
        });
        on(this, 'response-join-room', (para: ResponseInfo) => {
            console.log('response-join-room', para);
            boardcast.alert(para.desc);
            if (para.code) {
                navigate('/room');
            }
        });
        on(this,'response-watch-game',(para:ResponseInfo)=>{
            boardcast.alert(para.desc);
            if(para.code) {
                navigate('/game');
            }
        })
        socket.emit('get-room-list');
    }

    componentWillUnmount(): void {
        off(this);
    }

    render(): React.ReactNode {
        let rooms = this.state.roomList.map((value, i) => {
            return (<tr key={i}>
                <td>{value.name}</td>
                <td>{value.count}/{value.maxCount}</td>
                <td>
                    {value.isIngame? <button onClick={() => {
                        socket.emitWithLogin('watch-game', value.name);
                    }}>Watch</button>:
                    <button onClick={() => {
                        socket.emitWithLogin('join-room', value.name);
                    }}>Join</button>}
                </td>
            </tr>)
        })

        return (
            <div className="roomListPanel">
                <div className="subTitle">Room List</div>
                <div className="buttonGroup">
                    <NavigateButton to='/'>Back To Home</NavigateButton>
                    <button onClick={() => socket.emit('get-room-list')}>Fresh</button>
                </div>
                <table className="roomTable" align="center" border={1}>
                    <thead>
                        <tr>
                            <th>??????</th>
                            <th>??????</th>
                            <th>??????</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms}
                    </tbody>
                    {/* <tfoot>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tfoot> */}
                </table>
            </div>
        )
    }
}

export default RoomListPage;