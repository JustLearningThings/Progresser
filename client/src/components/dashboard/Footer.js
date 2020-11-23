import React from 'react'
import { BrowserRouter, Link } from 'react-router-dom'

export default function Footer() {
    return (
        <div id="nav-footer">
            <Link to='/about'><p style={{ color: 'white' }}>Progresser &#169; {new Date().getFullYear()}</p></Link>
        </div>
    )
}