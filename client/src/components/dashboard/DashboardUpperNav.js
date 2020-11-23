import React, { useContext } from 'react'
import { BrowserRouter, Link, useHistory } from 'react-router-dom'
import AuthContext from '../../auth/authContext'
import { logout } from '../../auth/auth'

import './DashboardUpperNav.css'

// conditional rendering for logged/unlogged in in users
// to display profile photo and signout
// and to not display login
export default function DashboardUpperNav() {
    let authContext = useContext(AuthContext)
    let history = useHistory()

    return (
        <div id="upper-nav">
            <ul>
                <li>
                    <Link to={`/user/${ authContext.userId }`}>{ authContext.username }</Link>
                </li>
                <li>
                    <Link to='/help'>Help</Link>
                </li>
                <li>
                    <Link to='/about'>About</Link>
                </li>
                <li>
                    { authContext.userId
                    ? <Link to='#' onClick={() => logout(history, authContext)}>Log out</Link>
                    : ''
                    }
                </li>
            </ul>
        </div>
    )
}