import React from "react";

interface HomePageProp {
    startgame: () => void,
}

class HomePage extends React.Component<HomePageProp> {
    constructor(props: HomePageProp) {
        super(props)
    }

    render(): React.ReactNode {
        return (
            <div>
                <h1>Gobang Game</h1>
                <button onClick={this.props.startgame}>Start</button>
            </div>
        )
    }
}

export default HomePage;