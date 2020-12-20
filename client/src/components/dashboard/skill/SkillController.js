import React, { useState, useEffect, useContext } from 'react'
import { BrowserRouter, useLocation, useHistory, Link } from 'react-router-dom'
import Loading from '../../Loading'
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
        level: 0,
        xp: 0,
        requiredXp: 0,
        description: '',
        actions: [],
        date: Date.now()
    })

    useEffect(() => {
        authFetch(`/api/skills/${id}`, null, history, authContext.changeUser, res => {
            res.json()
            .then(res => {
                setSkill({
                    title: res.name,
                    level: res.level,
                    xp: res.xp,
                    requiredXp: res.requiredXp,
                    description: res.description,
                    actions: res.actions,
                    date: res.date
                })
            })
            .catch(err => console.error(err))
        })
    }, [])

    function handleDelete() {
        authFetch(`/api/skills/${id}`, { method: 'DELETE' }, history, authContext.changeUser, () => history.push('/dashboard/skills'))
    }

    let actionsList = []

    function updateXp(value) {
        let options = {
            method: 'PUT',
            body: new URLSearchParams(`value=${value}`),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }

        authFetch(`/api/skills/${id}?updateXp=true`, options, history, authContext.changeUser, res => {
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
                    level: res.updatedSkill.level,
                    xp: res.updatedSkill.xp,
                    requiredXp: res.updatedSkill.requiredXp,
                    description: res.updatedSkill.description,
                    actions: res.updatedSkill.actions,
                    date: res.updatedSkill.date,
                    badge
                })
            })
            .catch(err => console.error(err))
        })
    }

    if (skill.actions)
        skill.actions.forEach((action, i) => {
            actionsList.push((
                <li
                    key={i}
                    className='skill-controller-action'
                    onClick={() => updateXp(action.value)}
                > {action.name} </li>
            ))
        })

    const progressBarWidth = 100 * skill.xp / skill.requiredXp

    let date = ''

    if (skill.date && typeof skill.date === 'string') {
        date = new Date(skill.date)
        date = date.toLocaleDateString(undefined, { hour: 'numeric', minute: 'numeric' })
    }

    if (!skill.title) return (<Loading />)
    return (
        <div className='skill-controller'>
            { /* if a badge was earned/updated then show the popup notification */}
            {skill.badge && Object.keys(skill.badge).length > 0 ? <Popup
                showPopup={popupContext.setPopup}
                text={`${skill.badge.state === 'updated' ? `${skill.badge.name} badge had just leveled up` : `You earned a new badge: ${skill.badge.name}`}`}
            /> : ''}

            <h3>{skill.title}</h3>
            <div className='skill-controller-progress-bar-container'>
                <div className='skill-controller-xp'>{skill.xp}</div>
                <div className='skill-controller-level'>level: {skill.level}</div>
                <div className='skill-controller-progress-bar'>
                    <div
                        className='skill-controller-progress-bar-progress'
                        style={{ width: `${progressBarWidth}%` }}
                    >
                    </div>
                </div>
                <div className='skill-controller-required-xp'>{skill.requiredXp}</div>
            </div>
            <p className='skill-controller-description'>
                {skill.description}
            </p>
            <ul className='skill-controller-actions'>
                {actionsList}
            </ul>
            <span className='skill-controller-date'>
                Started on { date }
            </span>
            <span className='skill-controller-delete' onClick={() => handleDelete()}>
                Delete
            </span>
            <Link 
                className='skill-controller-edit'
                to={{
                    pathname: `/dashboard/skills/update/${id}`,
                    state: { id, skill, date, progressBarWidth }
                }}>
                Edit
            </Link>
        </div>
    )
}