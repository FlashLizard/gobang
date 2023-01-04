import React from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'

let nav: NavigateFunction | null

export default function navigate(path: string) {
    if(nav) nav(path);    
} 

export function GetNavigate() {
    nav = useNavigate();
    return null;
}