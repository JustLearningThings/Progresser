import React, { useContext } from 'react'
import {BrowserRouter, Route, Redirect} from 'react-router-dom'
import AuthContext from '../auth/authContext'

export default function ProtectedRoute({ children, ...rest }) {
    let authContext = useContext(AuthContext)

    return (
        <Route {...rest} render={({ location }) =>
            authContext.userId && authContext.userId.length > 0
            ? children
            : <Redirect to={{
                pathname: '/login',
                state: { from: location }
            }} />
        } />
    )
}