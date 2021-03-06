import React from 'react'

import Nav from './Nav'
import './About.css'

export default function About() {
    return (
        <div id='about'>
            <Nav />
            <main id='about-main'>
                <h2>About progresser</h2>
                <p>Progresser is a web application created to help you achieve your goals. It is built by Denis Smocvin.</p>
                <p>You can find the project on <a target='_blank' href='https://github.com/JustLearningThings/Progresser'>github</a>.</p>
            </main>
        </div>
    )
}