import React, { useState, useContext } from 'react'
import { BrowserRouter, useHistory, useLocation } from 'react-router-dom'

import AuthContext from '../../../auth/authContext'
import { refresh, authFetch } from '../../../auth/auth'

import './PlanController.css'
import './PlanForm.css'

export default function PlanForm({ method }) {
    let authContext = useContext(AuthContext)
    let history = useHistory()
    let location = useLocation()

    let id, plan, date, progressBarWidth
    let initialState = {
        name: '',
        description: '',
        tasks: []
    }

    if (method === 'PUT') {
        id = location.state.id
        plan = location.state.plan
        date = location.state.date
        progressBarWidth = location.state.progressBarWidth

        initialState = {
            name: plan.title,
            description: plan.description,
            xp: plan.xp,
            requiredXp: plan.requiredXp,
            date: plan.date,
            tasks: plan.tasks
        }
    }

    let [form, setForm] = useState(initialState)

    function handleChange(e, attr, i = (-1)) {
        // if i is not -1, it is an index, thus update task
        if (i !== -1) {
            let tasks = form.tasks

            tasks[i][attr] = e.target.value
            setForm({ ...form, tasks })
        }
        else setForm({ ...form, [attr]: e.target.value })
    }

    function handleSubmit(e) {
        e.preventDefault()

        function actionsToUrlEnocoded(tasks) {
            let actionsStr = ''

            tasks.forEach((task, i) => {
                if (task.name !== '' || task.value)
                    actionsStr += `tasks[${i}][name]=${encodeURIComponent(task.name)}&tasks[${i}][value]=${encodeURIComponent(task.value)}&`
            })

            return actionsStr.replace(/%20/g, '+')
        }

        // decide on the url based on the desired method
        let url = `/api/plans/${id}`

        if (method === 'POST') url = '/api/plans'

        // convert form data to form-urlencoded
        let urlEncodedPairs = []
        let urlEncodedData = ''
        let data = form

        for (let name in data) {
            if (name !== 'tasks' && name !== 'formTasks')
                urlEncodedPairs.push(`${encodeURIComponent(name)}=${encodeURIComponent(data[name])}`)
        }

        let tasks = actionsToUrlEnocoded(data.tasks)

        urlEncodedData = urlEncodedPairs.join('&').replace(/%20/g, '+')
        urlEncodedData += `&${tasks}`
        urlEncodedData = urlEncodedData.slice(0, -1)

        // send data
        let options = {
            method,
            body: urlEncodedData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }

        authFetch(url, options, history, authContext.changeUser, res => {
            res.json()
                .then(res => {
                    // assign id based on the API response (POST and PUT respond with different data)
                    let id = method === 'POST' ? res.id : res._id

                    history.push(`/dashboard/plans/${id}`, { id })
                })
                .catch(err => console.error(err))
        })
    }

    // function to add new task set of inputs
    function addTask() {
        let formTasks = form.tasks

        formTasks.push({ name: '', value: '' })
        setForm({ ...form, formTasks })
    }

    // function to remove an task input from the DOM
    function removeTask(i) {
        let formTasks = form.tasks

        formTasks.splice(i, 1)
        setForm({ ...form, formTasks })
    }

    // create tasks DOM elements
    let actionsList = []

    if (form.tasks)
        form.tasks.forEach((task, i) => {
            actionsList.push((
                <li
                    key={i}
                    className='plan-form-task'>
                    <div className='plan-form-task-container'>
                        <input className='plan-form-task-name' name='task-name' type='text' value={task.name} required onChange={e => handleChange(e, 'name', i)}></input>
                        <input className='plan-form-task-value' type='number' name='task-value' type='text' value={task.value} required onChange={e => handleChange(e, 'value', i)}></input>
                        <span className='plan-form-task-remove' onClick={e => removeTask(i)}>&#10060;</span>
                    </div>
                </li>
            ))
        })

    return (
        <div className='plan-form'>
            <h3>{method === 'PUT' ? 'Edit' : 'Add a'} plan</h3>
            <div id='plan-form-input-name-container'>
                <label htmlFor='plan-form-input-name'>Name</label>
                <input id='plan-form-input-name' name='name' type='text' value={form.name} required onChange={e => handleChange(e, 'name')}></input>
            </div>
            {(form.xp && form.requiredXp && progressBarWidth) ? (
                <div className='plan-form-progress-bar-container'>
                    <div className='plan-form-xp'>{form.xp}</div>
                    <div className='plan-form-progress-bar'>
                        <div
                            className='plan-form-progress-bar-progress'
                            style={{ width: `${progressBarWidth}%` }}
                        >
                        </div>
                    </div>
                    <div className='plan-form-required-xp'>{form.requiredXp}</div>
                </div>
            ) : ''}
            <p className='plan-form-description'>
                <label htmlFor='plan-form-input-description'>Description</label>
                <textarea id='plan-form-input-description' name='description' value={form.description} required onChange={e => handleChange(e, 'description')}></textarea>
            </p>
            <ul className='plan-form-tasks'>
                {(actionsList && actionsList.length > 0) ? actionsList : ''}
                <li id='plan-form-tasks-add' onClick={e => addTask()}>Add task</li>
            </ul>
            {date ? (
                <span className='plan-form-date'>
                    Started on {date}
                </span>
            ) : ''}
            <button type='submit' onClick={e => handleSubmit(e)}>Submit</button>
            <div style={{ clear: 'both' }}></div>
        </div>
    )
}