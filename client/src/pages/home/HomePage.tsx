import React from "react";


interface HomePageState {
    showCreateRoomPanel: boolean
}

class HomePage extends React.Component<{}, HomePageState> {
    constructor(props: any) {
        super(props)
        this.state = {
            showCreateRoomPanel: false
        }
    }

    renderCreateRoomPanel() {
        return (
            <div
                id={'createRoomPanel'}
            >
                <h2>Create Room</h2>
                <br></br>
                <p>Name</p> <input></input> 
                <br></br>
                <button>Create</button>
                <button onClick={()=>this.setState({showCreateRoomPanel: false})}>Cancel</button>
            </div>
        )
    }

    render(): React.ReactNode {
        return (
            <div>
                <h1>Gobang Game</h1>
                <button onClick={()=>window.location.href='/game'}>Start</button>
                <button onClick={()=>this.setState({showCreateRoomPanel: true})}>Create Room</button>
                <button onClick={()=>window.location.href='/roomlist'}>Room List</button>
                {this.state.showCreateRoomPanel && this.renderCreateRoomPanel()}
            </div>
        )
    }
}

export default HomePage;