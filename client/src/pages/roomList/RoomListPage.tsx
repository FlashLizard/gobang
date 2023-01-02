import React from "react";
import { RoomInfo } from "../../communication/parameters";
import { socket } from "../../communication/connection";

interface RoomListPageState {
    roomList: RoomInfo[]
}

class RoomListPage extends React.Component<{},RoomListPageState> {
    constructor(props: any) {
        super(props)
        this.state = {
            roomList: []
        }
    }

    componentDidMount(): void {
        socket.on('room-list',()=>{})
    }

    componentWillUnmount(): void {
        socket.emit('get-room-list')
    }

    render(): React.ReactNode {
        let rooms = this.state.roomList.map((value)=>{
            return (<tr>
                <td>{value.name}</td>
                <td>{value.count}/{value.maxCount}</td>
                <td>
                    <button>加入房间</button>
                </td>
            </tr>)
        })

        return (
            <div>
                <h1>Room List</h1>
                <button onClick={()=>window.location.href='/'}>Back To Home</button>
                <button onClick={()=>socket.emit('get-room-list')}>Fresh</button>
                <br></br>
                <table align="center" border={1}>
                    <tr>
                        <td>名称</td>
                        <td>人数</td>
                        <td>按钮</td>
                    </tr>
                    {rooms}
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </table>
            </div>
        )
    }
}

export default RoomListPage;