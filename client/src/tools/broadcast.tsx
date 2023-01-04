import './broadcast.css'
import ReactDOM from "react-dom";

export let config = {
    interval: 400,
}

class Boardcast {
    box: HTMLElement
    canContinue: boolean = true;

    constructor() {
        this.box = document.createElement('div');
        this.box.className = "messageBox";
        document.body.appendChild(this.box);
    }
    alert(mesg: string, time: number = 1000) {
        let fun = () => {
            let div = document.createElement('div');
            div.className = "message fadein";
            div.innerHTML = mesg;
            this.box.appendChild(div);
            setTimeout(() => div.className = 'message fadeout', 0.2 * 1000 + time);
            setTimeout(() => div.remove(), 0.4 * 1000 + time);
            this.canContinue = false;
            setTimeout(()=>this.canContinue=true, config.interval);
        }
        if(this.canContinue) fun();
        else {
            setTimeout(()=>this.alert(mesg,time), config.interval);
        }
    }
}

const boardcast = new Boardcast();

export default boardcast;