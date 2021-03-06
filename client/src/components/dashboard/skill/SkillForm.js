import React, { useState, useContext } from 'react'
import { BrowserRouter, useHistory, useLocation } from 'react-router-dom'

import AuthContext from '../../../auth/authContext'
import { authFetch } from '../../../auth/auth'

import '../Controller.css'
import '../ControllerForm.css'
import './SkillForm.css'

export default function SkillForm({ method }) {
    let authContext = useContext(AuthContext)
    let history = useHistory()
    let location = useLocation()

    let id, skill, date, progressBarWidth
    let initialState = {
        name: '',
        description: '',
        actions: []
    }

    if (method === 'PUT') {
        id = location.state.id
        skill = location.state.skill
        date = location.state.date
        progressBarWidth = location.state.progressBarWidth

        initialState = {
            name: skill.title,
            description: skill.description,
            level: skill.level,
            xp: skill.xp,
            requiredXp: skill.requiredXp,
            date: skill.date,
            actions: skill.actions
        }
    }

    let [form, setForm] = useState(initialState)

    function handleChange(e, attr, i=(-1)) {
        // if i is not -1, it is an index, thus update action
        if (i !== -1) {
            let actions = form.actions
            
            actions[i][attr] = e.target.value
            setForm({ ...form, actions })
        }
        else setForm({ ...form, [attr]: e.target.value })
    }

    function handleSubmit(e) {
        e.preventDefault()

        function actionsToUrlEnocoded(actions) {
            let actionsStr = ''

            actions.forEach((action, i) => {
                if (action.name !== '' || action.value)
                    actionsStr += `actions[${i}][name]=${encodeURIComponent(action.name)}&actions[${i}][value]=${encodeURIComponent(action.value)}&`
            })

            return actionsStr.replace(/%20/g, '+')
        }

        // decide on the url based on the desired method
        let url = `/api/skills/${id}`

        if (method === 'POST') url = '/api/skills'

        // convert form data to form-urlencoded
        let urlEncodedPairs = []
        let urlEncodedData = ''
        let data = form

        for (let name in data) {
            if (data[name] && name !== 'actions' && name !== 'formActions')
                urlEncodedPairs.push(`${encodeURIComponent(name)}=${encodeURIComponent(data[name])}`)
        }

        let actions = actionsToUrlEnocoded(data.actions)

        urlEncodedData = urlEncodedPairs.join('&').replace(/%20/g, '+')
        urlEncodedData += `&${actions}`
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
                let id = method === 'POST' ? res.id : res.updatedSkill._id

                history.push(`/dashboard/skills/${id}`, { id })
            })
            .catch(err => console.error(err))
        })
    }

    // function to add new action set of inputs
    function addAction() {
        let formActions = form.actions

        formActions.push({ name: '', value: '' })
        setForm({ ...form, formActions })
    }

    // function to remove an action input from the DOM
    function removeAction(i) {
        let formActions = form.actions

        formActions.splice(i, 1)
        setForm({ ...form, formActions })
    }

    // create actions DOM elements
    let actionsList = []
    let actionMaxValue = 10 + (initialState.level - 1) * 10

    if (form.actions)
        form.actions.forEach((action, i) => {
            actionsList.push((
                <li
                    key={i}
                    className='skill-form-action'>
                        <div className='skill-form-action-inputs-container'>
                            <div className='skill-form-action-name-container'>
                                <label>Name</label>
                                <input className='skill-form-action-name' name='action-name' type='text' value={action.name} required onChange={e => handleChange(e, 'name', i)}></input>
                            </div>
                            <div className='skill-form-action-value-container'>
                                <label>Value</label>
                                <input className='skill-form-action-value' type='number' min='1' max={actionMaxValue} name='action-value' value={action.value} required onChange={e => handleChange(e, 'value', i)}></input>
                            </div>
                        </div>
                        <span className='skill-form-action-remove' onClick={e => removeAction(i)}>&#10060;</span>
                </li>
            ))
        })

        return (
            <div id='skill-form-container'>
                <h2 className='main-title'>{ method === 'PUT' ? 'Edit' : 'Add a' } skill</h2>
                <form id='skill-form'>
                    <div id='skill-form-inputs'>
                        <div id='skill-controller-left'>
                            <div id='name-input-container'>
                                <label htmlFor='skill-form-input-name'>Name</label>
                                <input id='skill-form-input-name' name='name' type='text' value={form.name} required onChange={e => handleChange(e, 'name')}></input>
                            </div>
                            <div id='description-input-container'>
                                <label htmlFor='skill-form-input-description'>Description</label>
                                <textarea id='skill-form-input-container' name='description' value={form.description} onChange={e => handleChange(e, 'description')}></textarea>
                            </div>
                        </div>
                        <div id='actions'>
                            <div>
                                <h3>Actions</h3>
                                <ul>
                                    {(actionsList && actionsList.length > 0) ? actionsList : ''}
                                    <li id='skill-form-task-add' onClick={() => addAction()}>Add action</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div id='submit-button-container'>
                        <button type='submit' onClick={e => handleSubmit(e)}>Submit</button>
                    </div>
                </form>
            </div>
        )
}