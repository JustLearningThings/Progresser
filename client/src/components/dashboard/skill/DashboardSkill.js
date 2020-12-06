import React from 'react'
import { BrowserRouter, useHistory } from 'react-router-dom'

import './DashboardSkill.css'

export default function DashboardSkill({ title, xp, requiredXp, description, id, level, date, actions }) {
    const history = useHistory()
    const progressBarWidth = 100 * xp / requiredXp

    return (
        <div className='skill' onClick={() => {
            history.push(`/dashboard/skills/${id}`, { id })
            }}>
            <h3 className='skill-title'>{ title }</h3>
            <p className='skill-progress-bar-xp'>XP: {xp}/{requiredXp}</p>
            <div className='skill-progress-bar'>
                <div
                    className='skill-progress-bar-inner'
                    style={{ width: `${progressBarWidth}%` }}
                ></div>
            </div>
            <p className='skill-description'>
                {description}
            </p>
        </div>
    )
}