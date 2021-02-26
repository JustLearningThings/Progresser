import React, { useState, useEffect, useContext } from 'react'
import { BrowserRouter, useHistory } from 'react-router-dom'

import AuthContext from '../../../auth/authContext'
import { authFetch } from '../../../auth/auth'

import './Profile.css'

export default function Profile() {
    let authContext = useContext(AuthContext)
    let history = useHistory()

    let [user, setUser] = useState({
        username: '',
        skills: [],
        plans: [],
        badges: [],
        stats: {
            points: 0,
            earnedBadges: 0,
            plans: {
                completed: 0,
                completedTasks: 0,
                created: 0
            },
            skills: {
                completedLevels: 0,
                earnedXp: 0,
                created: 0
            }
        },
        date: ''
    })

    useEffect(() => {
        authFetch('/api/user', null, history, authContext.changeUser, res => 
            res.json()
            .then(res => setUser({
                username: res.username,
                skills: res.skills,
                plans: res.plans,
                badges: res.badges,
                stats: res.stats,
                date: res.date
            }))
            .then(res => console.log(res))
        )
    },[])

    let date = ''

    if (user.date && typeof user.date === 'string') {
        date = new Date(user.date)
        date = date.toLocaleDateString(undefined, { hour: 'numeric', minute: 'numeric' })
    }

    // for badges
    const ImageColorScheme = {
        common: 'rgba(220, 20, 60, .6)',
        rare: 'rgba(65, 105, 205, .7)',
        honored: 'rgba(50, 205, 50, .5)',
        legendary: 'rgba(255, 215, 0, .6)'
    }

    let badgeCollection = []



    // if (user.badges && user.badges.length > 0) {
    //     user.badges.forEach((badge, idx) => {
    //         badgeCollection.push(
    //             <li key={idx} className='badge-collection-badge'>
    //                 <img
    //                     src={badge.base64}
    //                     alt={`Badge: ${badge.description}`}
    //                 />
    //                 <p>{badge.name}</p>
    //             </li>
    //     )})}
    if (user.badges && user.badges.length > 0) {
        for(let i = 0; i < 3 && user.badges[i]; i++)
            badgeCollection.push(
                <li key={i} className='badge-collection-badge'>
                    <img src={user.badges[i].base64} alt={`${user.badges[i].name} badge icon`} />
                    <p>{user.badges[i].name}</p>
                </li>
            )
    }
    else {}

    return (
        <div id='profile'>
            <h2 className='main-title'>Profile</h2>
            <div className='main-overflow-hidden'>
                <div id='main-stats'>
                    <section id='general-stats'>
                        <h3 className='stat-header'>General</h3>
                        <p>Rank: <span id='user-rank'>novice</span></p>
                        <p>Points: {user.stats.points}</p>
                        <p>Join date: &nbsp;<span id='user-date'>{date}</span></p>
                    </section>
                    <div id='card-stats'>
                        <section id='skills-stats'>
                            <h3 className='card-stats-header'>Skills</h3>
                            <div className='upper-stats'>
                                <div className='circle-stat-container'>
                                    <div className='circle circle-orange'>{user.stats.skills.created}</div>
                                    <h5>Created</h5>
                                </div>
                                <div className='circle-stat-container'>
                                    <div className='circle circle-purple'>{user.stats.skills.created}</div>
                                    <h5>Alive</h5>
                                </div>
                                <div className='circle-stat-container'>
                                    <div className='circle circle-blue'>{user.stats.skills.created}</div>
                                    <h5>Deleted</h5>
                                </div>
                            </div>
                            <div className='lower-stats'>
                                <p>Completed levels: {user.stats.skills.completedLevels}</p>
                                <p>Earned xp: {user.stats.skills.earnedXp}</p>
                            </div>
                        </section>
                        <section id='plans-stats'>
                            <h3 className='card-stats-header'>Plans</h3>
                            <div className='upper-stats'>
                                <div className='circle-stat-container'>
                                    <div className='circle circle-orange'>{user.stats.plans.created}</div>
                                    <h5>Created</h5>
                                </div>
                                <div className='circle-stat-container'>
                                    <div className='circle circle-purple'>{user.stats.plans.created}</div>
                                    <h5>Alive</h5>
                                </div>
                                <div className='circle-stat-container'>
                                    <div className='circle circle-blue'>{user.stats.plans.created}</div>
                                    <h5>Deleted</h5>
                                </div>
                            </div>
                            <div className='lower-stats'>
                                <p>Completed plans: {user.stats.plans.completed}</p>
                                <p>Completed tasks: {user.stats.plans.completedTasks}</p>
                            </div>
                        </section>
                    </div>
                </div>
                <section id='badge-stats'>
                    <h3>Badges</h3>
                    <div id='badges-stats-collection-container'>
                        <div id='badges-stats-collection'><ul>
                            {badgeCollection}
                            <a href='/dashboard/badges'><p id='badges-stats-collection-link'>All your badges...</p></a>
                        </ul></div>
                    </div>
                    <div id='badges-stats-text'>
                        <ul>
                            <li>Badges: {user.stats.earnedBadges}</li>
                            <li>Distinct badges: {user.stats.earnedBadges}</li>
                            <li>Points from badges: {user.stats.earnedBadges}</li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    )
}