import React from 'react';
import HomePage from './pages/home/HomePage';
import GamePage from './pages/game/GamePage';
import RoomListPage from './pages/roomList/RoomListPage';
import './App.css';
import './pages/Page.css'
import { Routes, Route, BrowserRouter, HashRouter } from 'react-router-dom'
import socket from './communication/socket';
import GlobalContext from './context/Context';
import { GetNavigate } from './components/GetNavigate';
import RoomPage from './pages/room/RoomPage';
import { ResponseInfo, RoomInfo } from './communication/parameters';
import boardcast from './tools/broadcast';
import { basename } from './communication/settings';
import Login from './components/login/Login';
import { languageId } from './context/language';
import Page from './pages/Page';
import { LanSelector } from './components/lanSelector/LanSelector';

interface AppState {
  roomName: string,
  lan: number,
}

class App extends React.Component<any, AppState> {


  constructor(props: any) {
    super(props);
    this.state = {
      roomName: "None",
      lan: languageId.zh,
    }
    this.setLan = this.setLan.bind(this);
  }

  setLan(lan: number) {
    this.setState({ lan: lan });
  }

  render(): React.ReactNode {
    return (
      <div className='wrapper'>
        <GlobalContext.Provider value={{ lan: this.state.lan, setLan: this.setLan }}>
          <div className='top-bar'>
            <LanSelector></LanSelector>
            <Login></Login>
          </div>
          <BrowserRouter basename={basename}>
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
