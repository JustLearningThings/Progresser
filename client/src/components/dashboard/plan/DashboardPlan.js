import React from 'react'
import { BrowserRouter, useHistory } from 'react-router-dom'

import './DashboardPlan.css'

export default function DashboardPlan({ title, progress, description, id, date }) {
    const history = useHistory()
    const progressBarWidth = progress

    return (
        <div className='plan' onClick={() => {
            history.push(`/dashboard/plans/${id}`, { id })
        }}>
            <h3 className='plan-title'>{title}</h3>
            <p className='plan-progress-bar-progress'>{progress === 100 ? 'completed' : `${progress}%`}</p>
            <div className='plan-progress-bar'>
                <div
                    className={`plan-progress-bar-inner${progressBarWidth == 100 ? '-completed' : ''}`}
                    style={{ width: `${progressBarWidth}%` }}
                ></div>
            </div>
            <p className='plan-description'>
                {description}                
            </p>
        </div>
    )
}