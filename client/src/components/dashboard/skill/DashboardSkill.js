import React from 'react'
import { BrowserRouter, useHistory } from 'react-router-dom'

import './DashboardSkill.css'

export default function DashboardSkill({ title, xp, requiredXp, description, id, level, date, actions }) {
    const history = useHistory()
    const progressBarWidth = 100 * xp / requiredXp

    return (
        <div className='skill' onClick={() => {
            // history.push(`/dashboard/skills/${id}`, { title, level, xp, requiredXp, description, actions, date, id })
            history.push(`/dashboard/skills/${id}`, { id })
            }}>
            {/* <h3 className='skill-title'>Skill 1</h3> */}
            <h3 className='skill-title'>{ title }</h3>
            <p className='skill-progress-bar-xp'>XP: {xp}/{requiredXp}</p>
            <div className='skill-progress-bar'>
                <div
                    className='skill-progress-bar-inner'
                    style={{ width: progressBarWidth }}
                ></div>
            </div>
            {/* this one may be optional */}
            <p className='skill-description'>
                {description}
                {/* Your skill description here.It should be concise and clear.We recommend to have a motivational word at the end. */}
            </p>
        </div>
    )
}