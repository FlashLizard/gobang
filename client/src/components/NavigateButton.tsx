import react from 'react'
import { useNavigate } from 'react-router-dom'

export default function NavigateButton(props: { to: string, children?: any, onClick?: (...para: any[]) => any }) {
    const navigate = useNavigate();
    return (
        <button onClick={() => {
            if(props.onClick) props.onClick();
            navigate(props.to);
        }}>{props.children}</button>
    )
}