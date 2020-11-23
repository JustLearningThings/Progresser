import React from 'react'
import { BrowserRouter, useHistory } from 'react-router-dom'

import './DashboardPlan.css'

export default function DashboardPlan({ title, xp, requiredXp, description, id, date }) {
    const history = useHistory()
    const progressBarWidth = 100 * xp / requiredXp

    return (
        <div className='plan' onClick={() => {
            history.push(`/dashboard/plans/${id}`, { id })
        }}>
            <h3 className='plan-title'>{title}</h3>
            <p className='plan-progress-bar-xp'>XP: {xp}/{requiredXp}</p>
            <div className='plan-progress-bar'>
                <div
                    className='plan-progress-bar-inner'
                    style={{ width: progressBarWidth }}
                ></div>
            </div>
            <p className='plan-description'>
                {description}                
            </p>
        </div>
    )
}