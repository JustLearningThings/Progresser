import React, { useState, useContext } from 'react'
import { BrowserRouter, useHistory, useLocation } from 'react-router-dom'

import AuthContext from '../../../auth/authContext'
import { authFetch } from '../../../auth/auth'

import '../Controller.css'
import '../ControllerForm.css'

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

        function tasksToUrlEncoded(tasks) {
            let tasksStr = ''

            tasks.forEach((task, i) => {
                if (task.name !== '' || task.steps)
                    tasksStr += `tasks[${i}][name]=${encodeURIComponent(task.name)}&`
            })

            return tasksStr.replace(/%20/g, '+')
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

        urlEncodedData = urlEncodedPairs.join('&').replace(/%20/g, '+')
        
        if (method === 'POST')
            urlEncodedData += `&${tasksToUrlEncoded(data.tasks)}`

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
                    let id = method === 'POST' ? res.id : res.updatedPlan._id

                    history.push(`/dashboard/plans/${id}`, { id })
                })
                .catch(err => console.error(err))
        })
    }

    // function to add new task set of inputs
    function addTask() {
        let formTasks = form.tasks

        formTasks.push({ name: '', steps: '' })
        setForm({ ...form, formTasks })
    }

    // function to remove an task input from the DOM
    function removeTask(i) {
        let formTasks = form.tasks

        formTasks.splice(i, 1)
        setForm({ ...form, tasks: formTasks })
    }

    // create tasks DOM elements
    let tasksList = []

    if (method === 'POST' && form.tasks)
        form.tasks.forEach((task, i) => {
            tasksList.push((
                <li
                    key={i}
                    className='plan-form-task'>
                    <div className='plan-form-task-name-container'>
                        <label>Name</label>
                        <input className='plan-form-task-name' name='task-name' type='text' value={task.name} required onChange={e => handleChange(e, 'name', i)}></input>
                    </div>
                    <span className='plan-form-task-remove' onClick={() => removeTask(i)}>&#10060;</span>
                </li>
            ))
        })

        return (
            <div id='plan-form-container'>
                <h2 className='main-title'>{ method === 'PUT' ? 'Edit' : 'Add a' } plan</h2>
                <form id='plan-form'>
                    <div id='plan-form-inputs'>
                        <div id='plan-controller-left'>
                            <div id='name-input-container'>
                                <label htmlFor='plan-form-input-name'>Name</label>
                                <input id='plan-form-input-name' name='name' type='text' value={form.name} required onChange={e => handleChange(e, 'name')}></input>
                            </div>
                            <div id='description-input-container'>
                                <label htmlFor='plan-form-input-description'>Description</label>
                                <textarea id='plan-form-input-description' name='description' value={form.description} onChange={e => handleChange(e, 'description')}></textarea>
                            </div>
                        </div>
                        <div id='tasks'>
                            {method === 'POST' ?
                                <div>
                                    <h3>Tasks</h3>
                                    <ul>
                                        {(tasksList && tasksList.length > 0) ? tasksList : ''}
                                        <li id='plan-form-task-add' onClick={() => addTask()}>Add task</li>
                                    </ul>
                                </div>
                                : ''}
                        </div>
                    </div>
                    <div id='submit-button-container'>
                        <button type='submit' onClick={e => handleSubmit(e)}>Submit</button>
                    </div>
                </form>
            </div>
        )
}