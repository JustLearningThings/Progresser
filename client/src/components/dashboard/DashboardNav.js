import React, { useState, lazy, useContext } from 'react'
import { BrowserRouter as Router, NavLink, Link, useHistory } from 'react-router-dom'
import AuthContext from '../../auth/authContext'
import { logout } from '../../auth/auth'

import './DashboardNav.css'
import Footer from './Footer'

// upper nav version form small viewports
const UpperNavMobile = lazy(() => import('./DashboardUpperNavMobile'))
// const UpperNavMobile = import('./DashboardUpperNavMobile')

function NavigationTabs({ isHamburgerClicked, isSmallViewport }) {
    let displayStyle = 'flex';

    if (window.innerWidth < 992)
        displayStyle = isHamburgerClicked ? 'block' : 'none'

    let upperNavMobile = []
    let links = ['Help', 'About']
    let n = 0;
    links.forEach((link, i) => {
        upperNavMobile.push(
            <NavLink 
                key={i}
                to={`/${link.toLowerCase()}`}
                className='nav-link'
                activeClassName='active-nav-link'
            >
                <div className='nav-tab'>
                    <div className='nav-tab-text'>
                    <h2>{link}</h2>
                    </div>
                </div>
            </NavLink>
        )
        // for key attribute of auth nav link
        n++;
    })

    let authContext = useContext(AuthContext)
    let history = useHistory()

    if(authContext.userId)
        upperNavMobile.push(
            <NavLink
                key={n}
                to='#'
                className='nav-link'
                activeClassName='active-nav-link'
                onClick={() => logout(history, authContext)}
            >
                <div className='nav-tab'>
                    <div className='nav-tab-text'>
                        <h2>Log out</h2>
                    </div>
                </div>
            </NavLink>
        )

    return (
        <div id="nav-tabs" style={{display: displayStyle}}>
            <NavLink to='/dashboard/skills' className='nav-link' activeClassName='active-nav-link'>
                <div className='nav-tab'>
                    <div className='nav-tab-text'>
                        <h2>Skills</h2>
                        <p>Manage your skills' progress</p>
                    </div>
                </div>
            </NavLink>
            <NavLink to='/dashboard/plans' className='nav-link' activeClassName='active-nav-link'>
                <div className='nav-tab'>
                    <div className='nav-tab-text'>
                        <h2>Plans</h2>
                        <p>Manage your plans' progress</p>
                    </div>
                </div>
            </NavLink>
            <NavLink to='/dashboard/badges' className='nav-link' activeClassName='active-nav-link'>
                <div className='nav-tab'>
                    <div className='nav-tab-text'>
                        <h2>Badges</h2>
                        <p>Your achivement collection</p>
                    </div>
                </div>
            </NavLink>
            { isSmallViewport ? upperNavMobile : '' }
            {/* { isSmallViewport ? <UpperNavMobile /> : '' } */}
        </div>
    )
}

function NavHeader() {
    return (
        <div id="nav-header">
            <h1 id="nav-header-heading">
                <Link to='/dashboard'>
                    Progresser
                </Link>
            </h1>
        </div>
    )
}

// function Footer() {
//     return (
//         <div id="nav-footer">
//             <p>Progresser &#169; {new Date().getFullYear()}</p>
//         </div>
//     )
// }

function HamburgerIcon({isHamburgerClicked, setHamburgerClickValue}) {
    return (
        <div id='hamburger'
            onClick={() => setHamburgerClickValue(!isHamburgerClicked)}
        >
            <div className='hamburger-tile'></div>
            <div className='hamburger-tile'></div>
            <div className='hamburger-tile'></div>
        </div>
    )
}

export default function DashboardNav({ isSmallViewport }) {
    const [isHamburgerClicked, setHamburgerClickValue] = useState(false)
    // const [isSmallViewport, setViewport] = useState(false)

    // useLayoutEffect(() => {
    //     // function to find out if the screen is small(mobile size/sm) and change state
    //     function getViewportBoolean() { window.innerWidth >= 992 ? setViewport(false) : setViewport(true) }
    //     // listen to windows resize event
    //     window.addEventListener('resize', getViewportBoolean)
    //     getViewportBoolean()
    //     return () => window.removeEventListener('resize', getViewportBoolean)
    // }, [isSmallViewport])

    let footer = window.innerWidth > 991 ? <Footer /> : ''

    return (
        <nav>
            <NavHeader />
            <HamburgerIcon
                isHamburgerClicked={isHamburgerClicked}
                setHamburgerClickValue={setHamburgerClickValue}
            />
            <NavigationTabs
                isSmallViewport={isSmallViewport}
                isHamburgerClicked={isHamburgerClicked}
            />
            {footer}
        </nav>
    )
}