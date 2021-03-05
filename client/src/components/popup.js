import React, { useEffect } from 'react'
import './popup.css'

export default function Popup({ setPopup, text }) {
    const closePopup = () => setPopup(false)
    const popupHoldTime = 10000

    useEffect(() => {
        const timer = setTimeout(() => closePopup(), popupHoldTime)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div id='popup'>
            <p id='popup-message'>{text}</p>
            <span id='popup-close' onClick={() => closePopup()}>&#10060;</span>
        </div>
    )
}