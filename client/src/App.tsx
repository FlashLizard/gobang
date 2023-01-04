import React from 'react';
import HomePage from './pages/home/HomePage';
import GamePage from './pages/game/GamePage';
import RoomListPage from './pages/roomList/RoomListPage';
import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import socket from './communication/socket';
import GlobalContext from './context/Context';
import { GetNavigate } from './components/GetNavigate';
import RoomPage from './pages/room/RoomPage';
import { RoomInfo } from './communication/parameters';

interface AppState {
  name: string,
  roomName: string,

}

class App extends React.Component<any, AppState> {


  constructor(props: any) {
    super(props);
    this.state = {
      name: Math.random().toString(),
      roomName: "None",
    }
  }

  componentDidMount(): void {
    socket.on('connect', () => {
      console.log(`${socket.id} connected `);
      socket.emit("login", { name: this.state.name, socketId: socket.id })
    })
    socket.on('room-info', (para: RoomInfo|null) => {
      this.setState({roomName: para ? para.name:"None"})
    })
  }

  render(): React.ReactNode {
    return (
      <div className='App'>
        <h1>{`Local Player ${this.state.name}; Room: ${this.state.roomName}`}</h1>
        <GlobalContext.Provider value={{ name: this.state.name }}>
          <BrowserRouter>
            <GetNavigate></GetNavigate>
            <Routes>
              <Route path='/' element={<HomePage />}></Route>
              <Route path='/game' element={<GamePage />}></Route>
              <Route path='/roomlist' element={<RoomListPage />}></Route>
              <Route path='/room' element={<RoomPage></RoomPage>}></Route>
            </Routes>
          </BrowserRouter>
        </GlobalContext.Provider>
      </div>
    );
  }
}

export default App;
