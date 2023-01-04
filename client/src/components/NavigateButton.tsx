import react from 'react'
import { useNavigate } from 'react-router-dom'
import navigate from './GetNavigate';

export default function NavigateButton(props: { to: string, children?: any, onClick?: (...para: any[]) => any }) {
    return (
        <button onClick={() => {
            if(props.onClick) props.onClick();
            navigate(props.to);
        }}>{props.children}</button>
    )
}