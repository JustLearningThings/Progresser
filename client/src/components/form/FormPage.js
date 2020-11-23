import React, { useState, useContext } from 'react'
import { BrowserRouter, Link, useHistory } from 'react-router-dom'
import './FormPage.css'

import AuthContext from '../../auth/authContext'
import { authFetch }  from '../../auth/auth'

const ModalError = React.lazy(() => import('./modalError.js'))

function FormPageNav() {
    return (
        <div id='nav'>
            <ul>
                <Link to='/' tabIndex='4'>Home</Link>
                <Link to='/help' tabIndex='5'>Help</Link>
                <Link to='/about' tabIndex='6'>About</Link>
            </ul>
        </div>
    )
}

export default function FormPage({ page }) {
    let [state, setState] = useState({ displayError: false, responseError: false, responseErrorMessage: '' })
    let authContext = useContext(AuthContext)
    let history = useHistory()

    let formHeading = 'Login'
    let greeting = 'Welcome back'
    let formAction = '/auth/login'
    let inputPattern = '.*'

    if (page === 'signup') {
        formHeading = 'Signup'
        greeting = 'Welcome'
        formAction = '/auth/signup'
        inputPattern = '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}'
    }

    function handleSubmit(e) {
        e.preventDefault()

        let data = []
        let inputs = document.getElementsByTagName('input')

        // validate input values
        if (!e.target.checkValidity()) {
            setState({ displayError: true })
            return
        }

        // push to array for further encoding
       for (const input of inputs)
        data.push(`${input.name}=${encodeURIComponent(input.value)}`)
        
        fetch(formAction, {
            method: 'POST',
            body: data.join('&'), // for the content type, join with ampersand
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(res => {
            if (res.ok) {
                setState({ responseError: false })
                res.json().then(res => {
                    localStorage.setItem('userId', res.userId)
                    localStorage.setItem('username', res.username)
                    authContext.changeUser(res.userId, res.username)
                    history.push('/dashboard')
                })
                //history.push('/dashboard')
            }
            else {
                res.json()
                .then(res => setState({ responseError: true, responseErrorMessage: res.message }))
                .catch(err => console.error(err))
                console.error(new Error(res.error))
            }
        })
        .catch(err => {
            console.error(err)
            alert('Error logging in. Please try again later !')
            setState({ responseError: true, responseErrorMessage: 'An error occured' })
        })
    }

    function handleModalExit() {
        setState({ responseError: false, responseErrorMessage: '' })
    }

    return (
        <div id='form-page'>
            <FormPageNav />
            <div id='form-container'>
                <div id='welcome'>
                    <h2>{greeting}</h2>
                    <p>
                        Take a moment to read the &nbsp;
                        <Link to='/help'>help</Link> &nbsp; page
                        to understand how this app works.
                    </p>
                </div>
                <form
                    className={state.displayError ? 'form-error' : ''}
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <h2>{formHeading}</h2>
                    <label htmlFor='username'>Username</label>
                    <input type='text' name='username' placeholder='username' required tabIndex='1'></input>
                    <label htmlFor='password'>Password</label>
                    <input type='password' name='password' placeholder='password' pattern={inputPattern} required tabIndex='2'></input>
                    <button type='submit' tabIndex='3'>Submit</button>
                    { page === 'signup'
                        ? <p><Link to='/login'>Already have an account ?</Link></p>
                        : <p><Link to='/signup'>Don't have an account ?</Link></p>
                    }
                </form>
            </div>
            { state.responseError && state.responseErrorMessage
                ? <ModalError
                    message={state.responseErrorMessage}
                    handleExit={handleModalExit}
                  />
                : ''
            }
        </div>
    )
}