export function random(a:number, b:number):number {
    if(a>b) throw 'Random:min bigger than max';
    let len = b-a+1;
    return a+Math.floor(Math.random()*len*100)%len;
}