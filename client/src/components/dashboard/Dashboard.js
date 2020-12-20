import React, { useState, useLayoutEffect, useContext } from 'react'
import { 
    BrowserRouter as Router,
    Switch,
    Route,
    useHistory,
} from 'react-router-dom'

import Loading from '../Loading'
import Popup, { PopupNotificationContext } from '../popup'

import AuthContext from '../../auth/authContext'
import DashboardNav from './DashboardNav'
import DashboardUpperNav from './DashboardUpperNav'

import './Dashboard.css'

// merge skills and plans styles into one file 

const SkillsList = React.lazy(() => import('./skill/SkillsList'))
const SkillController = React.lazy(() => import('./skill/SkillController'))
const SkillForm = React.lazy(() => import('./skill/SkillForm'))
const PlansList = React.lazy(() => import('./plan/PlansList'))
const PlanController = React.lazy(() => import('./plan/PlanController'))
const PlanForm = React.lazy(() => import('./plan/PlanForm'))
const BadgesList = React.lazy(() => import('./badge/BadgesList'))

export default function Dashboard() {
    const history = useHistory()

    let [skills, setSkills] = useState([])
    let [popup, setPopup] = useState({ show: false, text: ''})

    let upperNav = window.innerWidth > 991
        ? <DashboardUpperNav /> : ''

    const [isSmallViewport, setViewport] = useState(false)
    let authContext = useContext(AuthContext)

    useLayoutEffect(() => {
        // function to find out if the screen is small(mobile size/sm) and change state
        function getViewportBoolean() { window.innerWidth >= 992 ? setViewport(false) : setViewport(true) }
        // listen to windows resize event
        window.addEventListener('resize', getViewportBoolean)
        getViewportBoolean()
        return () => window.removeEventListener('resize', getViewportBoolean)
    }, [isSmallViewport])

    return (
        <div id='dashboard'>
            <PopupNotificationContext.Provider value={{ setPopup }}>
                { popup.show ? <Popup text={popup.text} showPopup={setPopup} /> : '' }

                <DashboardNav isSmallViewport={isSmallViewport} />
                {/* <DashboardUpperNav /> */}{upperNav}
                <div id='skills-container'>
                    <h1 id='dashboard-title'>Dashboard</h1>

                    <Switch>
                        <Route exact path='/dashboard/skills'>
                            <SkillsList />
                        </Route>
                        <Route exact path='/dashboard/skills/add'>
                            <SkillForm method='POST' />
                        </Route>
                        <Route exact path='/dashboard/skills/:id'>
                            <SkillController />
                        </Route>
                        <Route exact path='/dashboard/skills/update/:id'>
                            <SkillForm method='PUT' />
                        </Route>

                        <Route exact path='/dashboard/plans'>
                            <PlansList />
                        </Route>
                        <Route exact path='/dashboard/plans/add'>
                            <PlanForm method='POST' />
                        </Route>
                        <Route exact path='/dashboard/plans/:id'>
                            <PlanController />
                        </Route>
                        <Route exact path='/dashboard/plans/update/:id'>
                            <PlanForm method='PUT' />
                        </Route>

                        <Route exact path='/dashboard/badges'>
                            <BadgesList />
                        </Route>
                    </Switch>
                </div>
            </PopupNotificationContext.Provider>
        </div>
    )
}