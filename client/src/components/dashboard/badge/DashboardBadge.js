import React from 'react'
import './DashboardBadge.css'

export default function DashboardBadge({ name, description, src, tier }) {
    let ImageColorScheme = {
        common: 'rgba(220, 20, 60, .5)',
        rare: 'rgba(65, 105, 205, .5)',
        honored: 'rgba(50, 205, 50, .5)',
        legendary: 'rgba(255, 215, 0, .75)'
    }
    
    tier = tier.toLowerCase()

    let imgStyle = { backgroundColor: ImageColorScheme[tier]}

    return (
        <div className='badge'>
            <img
                className='badge-img'
                src={src}
                alt={`Badge: ${description}`}
                style={imgStyle}
            />
            <h4 className='badge-name'>{name}</h4>
            <p className='badge-description'>{description}</p>
        </div>
    )
}