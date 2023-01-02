export let test:{
    arr: any[]
    addElement(ele: any):void
    print(): void
} = {
    arr: [],
    addElement(ele: any) {
        this.arr.push(ele);
    },
    print() {
        console.log(this)
    }
}

export default {
    addElement(ele: any) {
        test.arr.push(ele);
    },
    print() {
        console.log(test)
    }
}