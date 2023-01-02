import React from 'react';
import HomePage from './pages/home/HomePage';
import GamePage from './pages/game/GamePage';
import RoomListPage from './pages/roomList/RoomListPage';
import './App.css';
import { Routes, Route } from 'react-router-dom'

class App extends React.Component {
  constructor(props: any) {
    super(props);
  }

  render(): React.ReactNode {
    return (
      <div className='App'>
        <Routes>
          <Route path='/' element={<HomePage />}></Route>
          <Route path='/game' element={<GamePage />}></Route>
          <Route path='/roomlist' element={<RoomListPage />}></Route>
        </Routes>
      </div>
    );
  }
}

export default App;
