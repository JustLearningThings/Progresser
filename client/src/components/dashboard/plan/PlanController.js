import React, { useState, useEffect, useContext } from 'react'
import { BrowserRouter, useLocation, useHistory, Link } from 'react-router-dom'
import Loading from '../../Loading'
import './PlanController.css'

import AuthContext from '../../../auth/authContext'
import { authFetch } from '../../../auth/auth'

export default function PlanController() {
    let authContext = useContext(AuthContext)
    let location = useLocation()
    let history = useHistory()
    let { id } = location.state

    let [plan, setPlan] = useState({
        title: '',
        progress: 0,
        description: '',
        tasks: [],
        date: Date.now()
    })

    useEffect(() => {
        authFetch(`/api/plans/${id}`, null, history, authContext.changeUser, res => {
            res.json()
                .then(res => {
                    setPlan({
                        title: res.name,
                        progress: res.progress,
                        description: res.description,
                        tasks: res.tasks,
                        date: res.date
                    })
                })
                .catch(err => console.error(err))
        })
    }, [])

    function handleDelete() {
        authFetch(`/api/plans/${id}`, { method: 'DELETE' }, history, authContext.changeUser, () => history.push('/dashboard/plans'))
    }

    let tasksList = []

    function updateProgress(value) {
        let options = {
            method: 'PUT',
            body: new URLSearchParams(`value=${value}`),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }

        authFetch(`/api/plans/${id}?updateProgress=true`, options, history, authContext.changeUser, res => {
            res.json()
                .then(res => {
                    setPlan({
                        title: res.name,
                        progress: res.progress,
                        description: res.description,
                        tasks: res.tasks,
                        date: res.date
                    })
                })
                .catch(err => console.error(err))
        })
    }

    if (plan.tasks)
        plan.tasks.forEach((task, i) => {
            tasksList.push((
                <li
                    key={i}
                    className={`plan-controller-task${task.completed ? ' plan-controller-task-completed' : ''}`}
                    onClick={() => task.completed ? '' : updateProgress(task.value)}
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
        <div className='plan-controller'>
            <h3>{plan.title}</h3>
            <div className='plan-controller-progress-bar-container'>
                <div className='plan-controller-progress'>{plan.progress === 100 ? 'completed' : `${plan.progress}%`}</div>
                <div className='plan-controller-progress-bar'>
                    <div
                        className={`plan-controller-progress-bar-progress${progressBarWidth == 100 ? '-completed' : ''}`}
                        style={{ width: `${progressBarWidth}%` }}
                    >
                    </div>
                </div>
            </div>
            <p className='plan-controller-description'>
                {plan.description}
            </p>
            <ul className='plan-controller-tasks'>
                {tasksList}
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