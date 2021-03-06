import React, { useState, useEffect, useContext } from 'react'
import { BrowserRouter, useLocation, useHistory, Link } from 'react-router-dom'
import Loading from '../../Loading'

import '../Controller.css'
import './PlanController.css'

import AuthContext from '../../../auth/authContext'
import { authFetch } from '../../../auth/auth'

import Popup from '../../popup'

export default function PlanController() {
    let authContext = useContext(AuthContext)
    let location = useLocation()
    let history = useHistory()
    let id = null

    if (location && location.state) id = location.state.id

    let [plan, setPlan] = useState({
        title: '',
        progress: 0,
        description: '',
        tasks: [],
        date: Date.now(),
    })

    let [showPopup, setPopup] = useState(false)

    useEffect(() => {
        authFetch(`/api/plans/${id}`, null, history, authContext.changeUser, res => {
            res.json()
                .then(res => {
                    setPlan({
                        title: res.name,
                        progress: res.progress,
                        description: res.description,
                        tasks: res.tasks,
                        date: res.date,
                    })


                })
                .catch(err => console.error(err))
        })
    }, [])

    function handleDelete() {
        authFetch(`/api/plans/${id}`, { method: 'DELETE' }, history, authContext.changeUser, () => history.push('/dashboard/plans'))
    }

    let tasksList = []

    function updateProgress(taskName) {
        let options = {
            method: 'PUT',
            body: new URLSearchParams(`completedTask=${taskName}`),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }

        authFetch(`/api/plans/${id}?updateProgress=true`, options, history, authContext.changeUser, res => {
            res.json()
                .then(res => {
                    // if by the end of this function, this object is not empty
                    // then a badge was earned/updated and a notification should be shown
                    const badge = {}

                    if (res.badge) {
                        badge.name = res.badge.name
                        badge.state = res.badge.state
                    }

                    setPlan({
                        title: res.updatedPlan.name,
                        progress: res.updatedPlan.progress,
                        description: res.updatedPlan.description,
                        tasks: res.updatedPlan.tasks,
                        date: res.updatedPlan.date,
                        badge
                    })

                    let shouldPopup = badge && Object.keys(badge).length > 0

                    if (shouldPopup) setPopup(true)
                })
                .catch(err => console.error(err))
        })
    }

    if (plan.tasks)
        plan.tasks.forEach((task, i) => {
            tasksList.push((
                <li
                    key={i}
                    className={`plan-controller-task ${task.completed ? ' plan-controller-task-completed' : ''}`}
                    onClick={() => task.completed ? '' : updateProgress(task.name)}
                > {task.name} </li>
            ))
        })

    const progressBarWidth = plan.progress

    let date = ''

    if (plan.date && typeof plan.date === 'string') {
        date = new Date(plan.date)
        date = date.toLocaleDateString(undefined, { hour: 'numeric', minute: 'numeric' })
    }

    if (!plan.title) return (<Loading />)

    return (
        <div id='plan-controller'>
            { /* if a badge was earned/updated then show the popup notification */ }
            { showPopup
                ? <Popup
                        setPopup={setPopup}
                        text={`${plan.badge.state === 'updated' ? `${plan.badge.name} badge had just leveled up` : `You earend a new badge: ${plan.badge.name}`}`}
                  />
                : ''
            }

            <h2 className='main-title'>{plan.title}</h2>
            <div className='main-overflow-hidden'>
                <div id='plan-links'>
                    <span
                        id='plan-controller-delete'
                        onClick={() => handleDelete()}>
                        Delete
                </span>
                </div>
                <div id='plan-controller-left'>
                    <div id='main-stats'>
                        <div id='plan-completed'>
                            <h3 className='stat-header'>Completed</h3>
                            <div>
                                &nbsp;
                            <span className='stat-big-header'>{+plan.progress.toFixed(2)}</span>
                            &nbsp; %
                    </div>
                        </div>
                    </div>
                    <div id='main-stats-progress-bar'>
                        <div
                            id='main-stats-progress-bar-inner'
                            style={{ width: `${progressBarWidth}%` }}>
                        </div>
                    </div>
                    {plan.description ?
                        <div id='description'>
                            <h3 id='description-header'>Description</h3>
                            <p>{plan.description}</p>
                        </div>
                        : ''}
                </div>
                <div id='tasks'>
                    <h3>Tasks</h3>
                    <ul>{tasksList}</ul>
                </div>
                { date ?
                    <span id='date'>Created: {date}</span>
                : '' }
            </div>
        </div>
    )
}