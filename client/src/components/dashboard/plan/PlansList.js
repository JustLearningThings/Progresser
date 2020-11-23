import React, { useState, useEffect, useContext } from 'react'
import { BrowserRouter, useHistory } from 'react-router-dom'
import DashboardPlan from './DashboardPlan'
import AddButton from '../AddButton'

import AuthContext from '../../../auth/authContext'
import { authFetch } from '../../../auth/auth'

export default function PlansList() {
    let [plans, setPlans] = useState([])
    let authContext = useContext(AuthContext)
    let history = useHistory()

    useEffect(() => {
        authFetch('/api/plans', null, history, authContext.changeUser, res => {
            res.json()
                .then(res => {
                    let responsePlans = []

                    res.forEach(plan => {
                        responsePlans.push((
                            <DashboardPlan
                                key={plan._id}
                                title={plan.name}
                                xp={plan.xp}
                                requiredXp={plan.requiredXp}
                                description={plan.description}
                                id={plan._id}

                                level={plan.level}
                                actions={plan.actions}
                                date={plan.date}
                            />
                        ))
                    })

                    setPlans(responsePlans)
                })
                .catch(err => console.error(err))
        })
    }, [])

    // the below assumes that plans is not empty
    return (
        <div id='plans'>
            {plans}
            {/* added this condition so that the add button won't load without the plans
            as it looks bad */}
            {/* {(plans && plans.length > 0) ? <AddButton element='plan' /> : ''} */}
            <AddButton element='plan' />
        </div>
    )
}