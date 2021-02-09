import React, { useState, useEffect, useContext } from 'react'
import { BrowserRouter, useLocation, useHistory, Link } from 'react-router-dom'
import Loading from '../../Loading'

import '../Controller.css'
import './SkillController.css'

import AuthContext from '../../../auth/authContext'
import { authFetch } from '../../../auth/auth'

import Popup, { PopupNotificationContext } from '../../popup'

export default function SkillController() {
    let popupContext = useContext(PopupNotificationContext)
    let authContext = useContext(AuthContext)
    let location = useLocation()
    let history = useHistory()
    let { id } = location.state

    let [skill, setSkill] = useState({
        title: '',
        description: '',
        level: 0,
        xp: 0,
        requiredXp: 0,
        actions: [],
        date: Date.now()
    })

    useEffect(() => {
        authFetch(`/api/skills/${id}`, null, history, authContext.changeUser, res => 
            res.json()
            .then(res => setSkill({
                title: res.name,
                description: res.description,
                level: res.level,
                xp: res.xp,
                requiredXp: res.requiredXp,
                actions: res.actions,
                date: res.date
            }))
            .catch(err => console.error(err))
        )
    }, [])

    function handleDelete() { authFetch(`/api/skills/${id}`, { method: 'DELETE' }, history, authContext.changeUser, () => history.push('/dashboard/skills')) }

    let actionsList = []

    function updateXp(value) {
        let options = {
            method: 'PUT',
            body: new URLSearchParams(`value=${value}`),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }

        authFetch(`/api/skills/${id}?updateXp=true`, options, history, authContext.changeUser, res =>
            res.json()
            .then(res => {
                // if by the end of this function, this object is not empty
                // then a badge was earned/updated and a notification should be shown
                const badge = {}

                if (res.badge) {
                    badge.name = res.badge.name
                    badge.state = res.badge.state
                }

                setSkill({
                    title: res.updatedSkill.name,
                    description: res.updatedSkill.description,
                    level: res.updatedSkill.level,
                    xp: res.updatedSkill.xp,
                    requiredXp: res.updatedSkill.requiredXp,
                    actions: res.updatedSkill.actions,
                    date: res.updatedSkill.date,
                    badge
                })
            })
            .catch(err => console.error(err))
        )
    }
    
    if (skill.actions)
        skill.actions.forEach((action, i) =>
            actionsList.push((
                <li
                    key={i}
                    onClick={() => updateXp(action.value)}>
                    <span className='action-name'>{action.name}</span>
                    <span className='action-value'>value: {action.value}</span>
                </li>
            ))
        )

    const progressBarWidth = 100 * skill.xp / skill.requiredXp

    let date = ''

    if (skill.date && typeof skill.date === 'string') {
        date = new Date(skill.date)
        date = date.toLocaleDateString(undefined, { hour: 'numeric', minute: 'numeric' })
    }

    // add conditional rendering(if description is present, render it, if not - do not)

    return (
        <div id='skill-controller'>
            { /* if a badge was earned/updated then show the popup notification */}
            {skill.badge && Object.keys(skill.badge).length > 0 ? <Popup
                showPopup={popupContext.setPopup}
                text={`${skill.badge.state === 'updated' ? `${skill.badge.name} badge had just leveled up` : `You earned a new badge: ${skill.badge.name}`}`}
            /> : ''}
            <h2 className='main-title'>{skill.title}</h2>
            <div className='main-overflow-hidden'>
                <div id='skill-links'>
                    <Link to={{
                        pathname: `/dashboard/skills/update/${id}`,
                        state: { id, skill, date, progressBarWidth }
                    }}>
                        Edit
                </Link>
                    <span
                        className='skill-links-delete'
                        onClick={() => handleDelete()}>
                        Delete
                </span>
                </div>
                <div id='skill-controller-left'>
                    <div id='main-stats'>
                        <div id='main-stats-upper'>
                            <div id='main-stats-level'>
                                <h3 className='stat-header'>Level</h3>
                                <h2 className='stat-big-header'>{skill.level}</h2>
                            </div>
                            <div id='main-stats-xp'>
                                <h3 className='stat-header'>XP</h3>
                                <div>
                                    <span className='stat-big-header'>{+skill.xp}</span>
                                &nbsp; / &nbsp; {skill.requiredXp}
                                </div>
                            </div>
                        </div>
                        <div id='main-stats-progress-bar'>
                            <div
                                id='main-stats-progress-bar-inner'
                                style={{ width: `${progressBarWidth}%` }}>
                            </div>
                        </div>
                    </div>
                    {skill.description ?
                        <div id='description'>
                            <h3 id='description-header'>Description</h3>
                            <p>{skill.description}</p>
                        </div>
                        : ''}
                </div>
                <div id='actions'>
                    <h3>Actions</h3>
                    <ul>{actionsList}</ul>
                </div>
                {date ?
                    <span id='date'>Created: {date}</span>
                    : ''}
            </div>
        </div>
    )
}