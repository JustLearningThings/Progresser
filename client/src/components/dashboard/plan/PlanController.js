import React, { useState, useEffect, useContext } from 'react'
import { BrowserRouter, useLocation, useHistory, Link } from 'react-router-dom'
import Loading from '../../Loading'
import './PlanController.css'

import AuthContext from '../../../auth/authContext'
import { authFetch } from '../../../auth/auth'

export default function SkillController() {
    let authContext = useContext(AuthContext)
    let location = useLocation()
    let history = useHistory()
    let { id } = location.state

    let [plan, setSkill] = useState({
        title: '',
        xp: 0,
        requiredXp: 0,
        description: '',
        actions: [],
        date: Date.now()
    })

    useEffect(() => {
        authFetch(`/api/plans/${id}`, null, history, authContext.changeUser, res => {
            res.json()
                .then(res => {
                    setSkill({
                        title: res.name,
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
        authFetch(`/api/plans/${id}`, { method: 'DELETE' }, history, authContext.changeUser, () => history.push('/dashboard/plans'))
    }

    let actionsList = []

    function updateXp(value) {
        let options = {
            method: 'PUT',
            body: new URLSearchParams(`value=${value}`),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }

        authFetch(`/api/plans/${id}?updateXp=true`, options, history, authContext.changeUser, res => {
            res.json()
                .then(res => {
                    setSkill({
                        title: res.name,
                        xp: res.xp,
                        requiredXp: res.requiredXp,
                        description: res.description,
                        actions: res.actions,
                        date: res.date
                    })
                })
                .catch(err => console.error(err))
        })
    }

    if (plan.actions)
        plan.actions.forEach((action, i) => {
            actionsList.push((
                <li
                    key={i}
                    className='plan-controller-action'
                    onClick={() => updateXp(action.value)}
                > {action.name} </li>
            ))
        })

    const progressBarWidth = 100 * plan.xp / plan.requiredXp

    let date = ''

    if (plan.date && typeof plan.date === 'string') {
        date = new Date(plan.date)
        date = date.toLocaleDateString(undefined, { hour: 'numeric', minute: 'numeric' })
    }

    if (!plan.title) return (<Loading />)
    return (
        <div className='plan-controller'>
            <h3>{plan.title}</h3>
            <div className='plan-controller-progress-bar-container'>
                <div className='plan-controller-xp'>{plan.xp}</div>
                <div className='plan-controller-progress-bar'>
                    <div
                        className='plan-controller-progress-bar-progress'
                        style={{ width: `${progressBarWidth}%` }}
                    >
                    </div>
                </div>
                <div className='plan-controller-required-xp'>{plan.requiredXp}</div>
            </div>
            <p className='plan-controller-description'>
                {plan.description}
            </p>
            <ul className='plan-controller-actions'>
                {actionsList}
            </ul>
            <span className='plan-controller-date'>
                Started on {date}
            </span>
            <span className='plan-controller-delete' onClick={() => handleDelete()}>
                Delete
            </span>
            <Link
                className='plan-controller-edit'
                to={{
                    pathname: `/dashboard/plans/update/${id}`,
                    state: { id, plan, date, progressBarWidth }
                }}>
                Edit
            </Link>
        </div>
    )
}