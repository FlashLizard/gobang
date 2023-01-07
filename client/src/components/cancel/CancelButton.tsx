import './CancelButton.css'

export default function CancelButton(props: { size?:number  , onClick?: (...para: any[]) => any }) {
    let size = Math.min(25,window.innerHeight*0.07);
    if(props.size) {
        size = props.size;
    }
    return (
        <div className="cancel" style={{height:`${size}px`, width:`${size}px`}} onClick={() => {
            if(props.onClick) props.onClick();
        }}></div>
    )
}