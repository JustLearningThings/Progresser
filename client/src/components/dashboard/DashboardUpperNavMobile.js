import React, { useContext } from 'react'
import { BrowserRouter as NavLink, useHistory } from 'react-router-dom'
import AuthContext from '../../auth/authContext'
import { logout } from '../../auth/auth'

// upper nav in mobile version should be defined with different classes
// and different html structure due to the desired design look
// hence new component
export default function UpperNav() {
    let authContext = useContext(AuthContext)
    let history = useHistory()

    return (
        <div id='uppernav-mobile' style={{marginBottom: '15px'}}>
            { authContext.userId ? <NavLink to='#' onClick={() => logout(history, authContext)}>Logout</NavLink> : '' }
            <NavLink to='/help' className='nav-link' activeClassName='active-nav-link'>
                <div className='nav-tab'>
                    <div className='nav-tab-text'>
                        <h2>Help</h2>
                    </div>
                </div>
            </NavLink>
            <NavLink to='/about' className='nav-link' activeClassName='active-nav-link'>
                <div className='nav-tab'>
                    <div className='nav-tab-text'>
                        <h2>About</h2>
                    </div>
                </div>
            </NavLink>
        </div>
    )
}