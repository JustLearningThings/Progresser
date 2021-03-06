import React, { Component, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom'

import { refresh } from '../auth/auth'
import AuthContext from '../auth/authContext'
import ProtectedRoute from '../helpers/ProtectedRoute'

import Loading from './Loading.js'
import './App.css';

// dynamic imports (code-splitting) may be a performance patch
const Dashboard = React.lazy(() => import('./dashboard/Dashboard'))
const FormPage = React.lazy(() => import('./form/FormPage'))
const Landing = React.lazy(() => import('./Landing'))
const Help = React.lazy(() => import('./Help'))
const About = React.lazy(() => import('./About'))

export default class App extends Component {
  constructor(props) {
    super(props)

    if (this.getCookie('accessToken'))
      this.state = {
        userId: localStorage.getItem('userId'),
        username: localStorage.getItem('username')
      }
      else 
        this.state = {
          userId: null,
          username: null
        }

    this.changeUser = this.changeUser.bind(this)
  }

  changeUser(userId, username) { this.setState(state => ({ ...state, userId, username })) }

  getCookie(name) {
    let cookies = document.cookie.split(';')
    let tokenValue = null

    cookies.forEach(cookie => {
      let pair = cookie.split('=')

      if (name === pair[0].trim()) tokenValue = decodeURIComponent(pair[1])
    })

    return tokenValue
  }

  cookieExists(name) { return document.cookie.includes(name) }

  componentDidMount() {
    if (!this.getCookie('accessToken')) refresh(this.changeUser)
  }

  render() {
    return (
      <div id="app">
        <Router>
          <Switch>
            <AuthContext.Provider value ={{ userId: localStorage.getItem('userId'), username: localStorage.getItem('username'), changeUser: this.changeUser }}>
              <ProtectedRoute path='/dashboard'>
                <Suspense fallback={<Loading />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
              <Route path='/signup'>
                <Suspense fallback={<Loading />}>
                  <FormPage page='signup' />
                </Suspense>
              </Route>
              <Route path='/login'>
                <Suspense fallback={<Loading />}>
                  <FormPage page='login' />
                </Suspense>
              </Route>
              <Route path='/help'>
                <Suspense fallback={<Loading />}>
                  <Help />
                </Suspense>
              </Route>
              <Route path='/about'>
                <Suspense fallback={<Loading />}>
                  <About />
                </Suspense>
              </Route>
              <ProtectedRoute path='/user/:id'>
                <Suspense fallback={<Loading />}>
                  <div id='userProfilePage'><h1>User Profile</h1></div>
                </Suspense>
              </ProtectedRoute>
              <Route exact path='/'>
                <Suspense fallback={<Loading />}>
                  <Landing />
                </Suspense>
              </Route>
            </AuthContext.Provider>
          </Switch>
        </Router>
      </div>
    )
  }
}