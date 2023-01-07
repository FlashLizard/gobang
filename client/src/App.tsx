import React from 'react';
import HomePage from './pages/home/HomePage';
import GamePage from './pages/game/GamePage';
import RoomListPage from './pages/roomList/RoomListPage';
import './App.css';
import './pages/Page.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import socket from './communication/socket';
import GlobalContext from './context/Context';
import { GetNavigate } from './components/GetNavigate';
import RoomPage from './pages/room/RoomPage';
import { ResponseInfo, RoomInfo } from './communication/parameters';
import boardcast from './tools/broadcast';
import Login from './components/login/Login';

interface AppState {
  roomName: string,
}

class App extends React.Component<any, AppState> {


  constructor(props: any) {
    super(props);
    this.state = {
      roomName: "None",
    }
  }

  render(): React.ReactNode {
    return (
      <div className='wrapper'>
        <Login></Login>
        <BrowserRouter>
          <GetNavigate></GetNavigate>
          <Routes>
            <Route path='/' element={<HomePage />}></Route>
            <Route path='/game' element={<GamePage />}></Route>
            <Route path='/roomlist' element={<RoomListPage />}></Route>
            <Route path='/room' element={<RoomPage></RoomPage>}></Route>
          </Routes>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
