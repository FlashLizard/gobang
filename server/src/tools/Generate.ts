export function matrix<T>(h:number,w:number,value:T):T[][] {
    let res = [];
    for(let i=0;i<h;i++) {
        let tmp = [];
        for(let j=0;j<w;j++) tmp.push(value);
        res.push(tmp);
    }
    return res;
}