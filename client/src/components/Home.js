import React, { Component } from 'react'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

export default function Home() {
    return (
        <Router>
            <div>
                <h1>Home Page</h1>
            </div>
        </Router>
    )
}