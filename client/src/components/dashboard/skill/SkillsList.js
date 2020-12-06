import React, { useState, useEffect, useContext } from 'react'
import { BrowserRouter, useHistory } from 'react-router-dom'
import DashboardSkill from './DashboardSkill'
import AddButton from '../AddButton'

import AuthContext from '../../../auth/authContext'
import { authFetch } from '../../../auth/auth'

export default function SkillsList() {
    let [skills, setSkills] = useState([])
    let authContext = useContext(AuthContext)
    let history = useHistory()

    useEffect(() => {
        authFetch('/api/skills', null, history, authContext.changeUser, res => {
            res.json()
                .then(res => {
                    let responseSkills = []

                    res.forEach(skill => {
                        responseSkills.push((
                            <DashboardSkill
                                key={skill._id}
                                title={skill.name}
                                xp={skill.xp}
                                requiredXp={skill.requiredXp}
                                description={skill.description}
                                id={skill._id}

                                level={skill.level}
                                actions={skill.actions}
                                date={skill.date}
                            />
                        ))
                    })

                    setSkills(responseSkills)
            })
            .catch(err => console.error(err))
        })
    }, [])

    // the below assumes that skills is not empty
    return (
        <div id='skills'>
            {skills}
            <AddButton element='skill' />        
        </div>
    )
}