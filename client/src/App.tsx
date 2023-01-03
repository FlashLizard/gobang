import React from 'react';
import HomePage from './pages/home/HomePage';
import GamePage from './pages/game/GamePage';
import RoomListPage from './pages/roomList/RoomListPage';
import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { Socket } from 'socket.io-client';
import socket from './communication/socket';

interface AppState {
  name: string
}
class App extends React.Component<any, AppState> {

  constructor(props: any) {
    super(props);
    this.state = {
      name: Math.random().toString(),
    }
  }

  componentDidMount(): void {
    socket.on('connect', () => {
      console.log(`${socket.id} connected `);
      socket.emit("login", { name: this.state.name, socketId: socket.id })
    })
  }

  render(): React.ReactNode {
    return (
      <div className='App'>
        <h1>{this.state.name}</h1>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<HomePage />}></Route>
            <Route path='/game' element={<GamePage />}></Route>
            <Route path='/roomlist' element={<RoomListPage />}></Route>
          </Routes>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
