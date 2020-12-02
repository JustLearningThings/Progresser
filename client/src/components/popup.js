import React, { useEffect } from 'react'
import './popup.css'

export default function Popup({ text, showState }) {
    // function to close the popup
    // with the state setting function from the component popup is called from
    const closePopup = () => showState(false)
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