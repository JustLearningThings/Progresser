import React, { useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'

import { logout } from '../auth/auth'
import AuthContext from '../auth/authContext'

import './Nav.css'

export default function Nav() {
    let authContext = useContext(AuthContext)
    let history = useHistory()

    return (
        <nav>
            <Link to='/'>Home</Link>
            <Link to='/about'>About</Link>
            {authContext.username && authContext.userId ?
                <div id='nav-auth-links'>
                    <Link to='/dashboard'>Dashboard</Link>
                    <Link to='#' onClick={() => logout(history, authContext)}>Log out</Link>
                </div>
                :
                <div id='nav-auth-links'>
                    <Link to='/signup'>Sign up</Link>
                    <Link to='/login'>Log in</Link>
                </div>
            }
        </nav>
    )
}