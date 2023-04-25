import { languageId } from '../context/language';
import './broadcast.css'

export let config = {
    interval: 400,
}

class Boardcast {
    box: HTMLElement
    canContinue: boolean = true;
    lan: number = languageId.zh;
    private recentStr: string|null = null;
    //private successOutput: boolean = true;

    constructor() {
        this.box = document.createElement('div');
        this.box.className = "messageBox";
        document.body.appendChild(this.box);
    }
    alert(mesg: string, time: number = 1000) {
        if(mesg===this.recentStr) {
            return;
        }
        let fun = () => {
            let div = document.createElement('div');
            div.className = "message fadein";
            div.innerHTML = mesg;
            this.box.appendChild(div);
            setTimeout(() => div.className = 'message fadeout', 0.2 * 1000 + time);
            setTimeout(() => div.remove(), 0.4 * 1000 + time);
            this.canContinue = false;
            setTimeout(()=>this.canContinue=true, config.interval);
            this.recentStr = mesg;
            setTimeout(()=>this.recentStr=null, 0.5*1000);
        }
        if(this.canContinue) fun();
        else {
            setTimeout(()=>this.alert(mesg,time), config.interval);
        }
    }
    alertL(mesg: (string|((str:string)=>void))[], time: number = 1000) {
        if(typeof(mesg)==='string') {
            this.alert(mesg, time);
            return;
        }
    }
}

const boardcast = new Boardcast();

export default boardcast;