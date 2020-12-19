import React from 'react'
import './DashboardBadge.css'

export default function DashboardBadge({ name, description, src, tier, quote, quoteAuthor }) {
    let ImageColorScheme = {
        common: 'rgba(220, 20, 60, .6)',
        rare: 'rgba(65, 105, 205, .7)',
        honored: 'rgba(50, 205, 50, .5)',
        legendary: 'rgba(255, 215, 0, .6)'
    }
    
    tier = tier.toLowerCase()

    let imgStyle = { backgroundColor: ImageColorScheme[tier]}

    return (
        <div className='badge badge-flip-container'>
            <div className='badge-flipper'>
                <div className='badge-front'>
                    <img
                        className='badge-img'
                        src={src}
                        alt={`Badge: ${description}`}
                        style={imgStyle}
                    />
                    <h4 className='badge-name'>{name}</h4>
                    <p className='badge-description'>{description}</p>
                </div>
                <div className='badge-back'>
                    <div className='badge-quote-content'>
                        {quote}
                    </div>
                    <div className='badge-quote-author'>
                        {quoteAuthor}
                    </div>
                </div>
            </div>
        </div>
    )
}