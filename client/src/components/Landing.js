import React, { useRef, useState, useEffect } from 'react'
import { BrowserRouter, Link } from 'react-router-dom'

import './Landing.css'

// svgs
import goals from '../assets/svg/goals.svg'
import powerful from '../assets/svg//powerful.svg'
import gaming from '../assets/svg/gaming.svg'
import learning from '../assets/svg/learning.svg'

// for animation certain parts of the page when intersecting with the viewport
function useIntersectionObserver(options={}) {
    const [ref, setRef] = useState(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setVisible(true)
        }, options)

        if (ref) observer.observe(ref)

        return () => {
            if (ref) observer.unobserve(ref)
        }
    }, [ref, options])

    return {setRef, visible}
}

export default function Landing() {
    const joinSectionHeaderVisibility = useIntersectionObserver()
    const joinSectionButtonsDivVisibility = useIntersectionObserver()
    const circle1Visibility = useIntersectionObserver()
    const circle2Visibility = useIntersectionObserver()
    const triangleVisibilty = useIntersectionObserver()

    return (
        <div id='landing'>
            <div id='sticky-section'>
                <section id='hero'>
                    <nav>
                        <ul>
                            <li><Link to='/signup'>Sign up</Link></li>
                            <li><Link to='/login'>Log in</Link></li>
                            <li><Link to='/help'>Help</Link></li>
                            <li><Link to='/about'>About</Link></li>
                        </ul>
                    </nav>
                    <div id='hero-content'>
                        <h1>Track your <span id='progress-span'>progress</span></h1>
                        <p>Achieve what you have planned with progresser in a structured and pleasant way</p>
                        <div id='hero-bnt-container'>
                            <Link to='/signup'><button id='hero-btn' className='btn signup-btn'>Sign up</button></Link>
                        </div>
                    </div>
                </section>
                <div id='scrollable-sticky-sections'>
                    <section id='skills-section'>
                        <h2 className='section-title'>Improve your abilities with skill cards</h2>
                        <div id='skills-demo'>
                            <div id='skill-demo-card-top' className='demo-card'>
                                <h3 className='card-title'>Programming</h3>
                                <p className='card-level'>Level: 7</p>
                                <div className='card-progress-bar'>
                                    <div className='card-progress-bar-inner'></div>
                                </div>
                                <p className='card-description'>Learn web development</p>
                                <ul className='card-actions'>
                                    <li className='card-action'>Learn ui/ux design</li>
                                    <li className='card-action'>Build harder projects</li>
                                    <li className='card-action'>Learn programming languages</li>
                                </ul>
                            </div>
                            <div id='skill-demo-card-bottom' className='demo-card'>
                                <h3 className='card-title'>Guitar</h3>
                                <p className='card-level'>Level: 3</p>
                                <div className='card-progress-bar'>
                                    <div className='card-progress-bar-inner'></div>
                                </div>
                                <p className='card-description'>Learn to play the guitar from zero</p>
                                <ul className='card-actions'>
                                    <li className='card-action'>Learn chords</li>
                                    <li className='card-action'>Note sheet reading</li>
                                    <li className='card-action'>Learn and play a song</li>
                                </ul>
                            </div>
                        </div>
                        <p className='section-paragraph'>Constantly improve your skills by completing tasks. Upgrade to the next level. Add tasks anytime and change their impact accordingly.</p>
                    </section>
                    <section id='plans-section'>
                        <h2 className='section-title'>Complete plans with plan cards</h2>
                        <div id='plans-demo'>
                            <div id='plan-demo-card' className='demo-card'>
                                <h3 className='card-title'>Guitar</h3>
                                <p className='card-level'>Level: 3</p>
                                <div className='card-progress-bar'>
                                    <div className='card-progress-bar-inner'></div>
                                </div>
                                <p className='card-description'>Learn to play the guitar from zero</p>
                                <ul className='card-actions'>
                                    <li className='card-action'>Learn chords</li>
                                    <li className='card-action'>Note sheet reading</li>
                                    <li className='card-action'>Learn and play a song</li>
                                </ul>
                            </div>
                        </div>
                        <p className='section-paragraph'>Outline your plans and gradually achieve them. You can also keep your completed plans to remind you of what you have already done.</p>
                    </section>
                </div>
            </div>
            <section id='description-section'>
                <div className='description-inner-section description-inner-section-left'>
                    <p className='description-paragraph'>Progresser will help you improve your abilities and complete your plans.</p>
                    <img src={goals} alt='an image of goal planning' />
                </div>
                <div  className='description-inner-section description-inner-section-right'>
                    <p className='description-paragraph'>Motivate yourself by earning upgradeable badges. Can you collect all the golden ones ?</p>
                    <img src={powerful} alt='an image depicting an achievement' />
                </div>
                <div className='description-inner-section description-inner-section-left'>
                    <p className='description-paragraph'>Learn in a gamified manner. Learn skills or complete plans and get points. Earn badges. Keep track of your improvements.</p>
                    <img src={gaming} alt='an image of a game controller' />
                </div>
                <div className='description-inner-section description-inner-section-right'>
                    <p className='description-paragraph'>Not sure what or where to learn ? In the <Link to='/help' style={{ textDecoration: 'underline' }}>help</Link> page you can find free online resources to learn from along with tips on effective learning.</p>
                    <img src={learning} alt='an image presenting an online learning process' />
                </div>
            </section>
            <section id='join-section'>
                <h2
                    ref={ joinSectionHeaderVisibility.setRef }
                    className={ joinSectionHeaderVisibility.visible ? 'appear-with-transform': '' }>
                    Create a free account
                </h2>
                <div
                    id='buttons-div'
                    ref={ joinSectionButtonsDivVisibility.setRef }
                    className={ joinSectionButtonsDivVisibility.visible ? 'appear-with-transform' : '' }>
                    <Link to='/signup'><button className='btn signup-btn'>Sign up</button></Link>
                    <p>or</p>
                    <Link to='/login'><button className='btn login-btn'>Log in</button></Link>
                </div>
                <div
                    id='circle1'
                    ref={circle1Visibility.setRef}
                    className={ circle1Visibility.visible ? 'circle appear-shapes' : 'circle'}>
                </div>
                <div
                    id='circle2'
                    ref={circle2Visibility.setRef}
                    className={ circle2Visibility.visible ? 'circle appear-shapes' : 'circle'}>
                </div>
                <div
                    id='triangle'
                    ref={triangleVisibilty.setRef}
                    className={ triangleVisibilty.visible ? 'appear-shapes' : '' }>
                </div>
            </section>
            <div id='footer'>
                <h3>Progresser</h3>
                <div id='links'>
                    <Link to='#'>GitHub</Link>
                    <Link to='#'>LinkedIn</Link>
                    <Link to='#'>Facebook</Link>
                </div>
            </div>
        </div>
    )
}