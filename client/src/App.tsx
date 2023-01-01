import React from 'react';
import HomePage from './pages/home/HomePage';
import GamePage from './pages/game/GamePage';
import './App.css';

interface AppState {
  pageName: string,
}

class App extends React.Component<{},AppState> {
  constructor(props: any) {
    super(props);
    this.state = {
        pageName: "home",
    };
  }

  setPage(pageName: string) {
    this.setState({pageName: pageName});
  }

  render(): React.ReactNode {
    let page: React.ReactNode = (<p>Null</p>);
    switch(this.state.pageName) {
        case "home": page = (<HomePage startgame={()=>{this.setPage("game")}}></HomePage>); break;
        case "game": page = (<GamePage></GamePage>); break;
    }
    return (
      <div className="App">
        {page}
      </div>
    );
  }
}

export default App;
