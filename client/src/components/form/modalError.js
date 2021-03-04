import React from 'react'
import './modalError.css'

export default function ModalError({ message, handleExit }) {
    return (
        <div id='error-modal' onClick={() => handleExit()}>
            <div id='error-modal-box'>
                <h3>Error</h3>
                <p>{message}</p>
            </div>
        </div>
    )
}