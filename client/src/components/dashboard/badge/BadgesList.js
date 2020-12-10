import React, { useState, useContext, useEffect } from 'react'
import { BrowserRouter, useHistory } from 'react-router-dom'

import AuthContext from '../../../auth/authContext'
import { authFetch } from '../../../auth/auth'

import DashboardBadge from './DashboardBadge'

export default function BadgesList() {
    let [badges, setBadges] = useState([])
    let authContext = useContext(AuthContext)
    let history = useHistory()

    useEffect(() => {
        authFetch('/api/user', null, history, authContext.changeUser, res => {
            res.json()
            .then(user => {
                let responseBadges = []

                user.badges.forEach((badge, i) => {
                    responseBadges.push(
                        <DashboardBadge
                            key={i}
                            name={badge.name}
                            description={badge.description}
                            src={badge.base64}
                            tier={badge.tier}
                            quote={badge.quote}
                            quoteAuthor={badge.quoteAuthor}
                        />
                    )
                })

                setBadges(responseBadges)
            })
            .catch(err => console.error(err))
        })
    }, [])

    return (
        <div id='badges'>
            {badges}
        </div>
    )
}