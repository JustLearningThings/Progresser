import React, { useContext, useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { logout } from '../auth/auth'
import AuthContext from '../auth/authContext'
import './Help.css'



export default function Help() {
    let authContext = useContext(AuthContext)
    let history = useHistory()
    let [badges, setBadges] = useState([])

    useEffect(() => {
        fetch('/api/badges/list')
        .then(res => res.json(res))
        .then(res => setBadges(res))
    }, [])

    let badgesList = []

    badges.forEach((badge, i) => {
        badgesList.push(
            <tr key={i}>
                <td><img className='badge-image' src={badge.base64} alt={`${badge.name} badge`} /></td>
                <td>{badge.name}</td>
                <td>{badge.description}</td>
            </tr>
        )
    })

    return (
        <div id='help'>
            <nav>
                <Link to='/'>Home</Link>
                <Link to='/about'>About</Link>
                { authContext.username && authContext.userId ?
                    <div id='nav-auth-links'>
                        <Link to='/dashboard'>Dashboard</Link>
                        <Link to='#' onClick={() => logout(history, authContext)}>Log out</Link>
                    </div>
                :
                    <div id='nav-auth-links'>
                        <Link to='/signup'>Sign up</Link>
                        <Link to='/login'>Log in</Link>
                    </div>
                }
            </nav>
            <div id='contents'>
                <aside id='help-aside'>
                    <p className='dropdown-header'><a href='#what-is-progresser'>What is Progresser ?</a></p>
                    <Dropdown content={{
                            header: 'Skills',
                            links: Array(
                                { href: '#creating-skills', text: 'Creating skills' },
                                { href: '#editing-and-deleting-skills', text: 'Editing and deleting skills' },
                                { href: '#xp-and-leveling-up', text: 'XP and leveling up' }
                            )
                        }}
                    />
                    <Dropdown content={{
                            header: 'Plans' ,
                            links: Array(
                                { href: '#creating-plans', text: 'Creating plans' },
                                { href: '#plan-completion-and-editing', text: 'Plan completion and editing' },
                                { href: '#deleting-plans', text: 'Deleting plans' }
                            )
                        }}
                    />
                    <Dropdown content={{
                            header: 'Badges',
                            links: Array(
                                { href: '#why-badges', text: 'Why badges ?' },
                                { href: '#earning-badges', text: 'Earning badges' },
                                { href: '#ranking-system', text: 'Ranking system' },
                                { href: '#what-badges-can-i-earn', text: 'What badges can I earn ?' }
                            )
                        }}
                    />
                    <p className='dropdown-header'><a href='#faq'>FAQ</a></p>
                </aside>
                <main id='help-main'>
                    <section className='main-section' id='what-is-progresser'>
                        <div className='main-section-header'>
                            <h1>What is Progresser ?</h1>
                            <hr></hr>
                        </div>
                        <div className='main-section-content'>
                            <p>Progresser is a web application meant to help you achieve your goals and complete your plans.</p>
                            <p>It is based on gamified learning principles. This means that you can track your progress on a skill or on plan completion as it was in a game having levels, experince points etc. Your profile is also important in this aspect. You get points by doing your tasks and can level up as a user.</p>
                        </div>
                    </section>
                    <section className='main-section' id='skills-help'>
                        <div className='main-section-header'>
                            <h1>Skills</h1>
                            <hr></hr>
                        </div>
                        <div className='main-section-content'>
                            <div className='main-section-inner-content' id='creating-skills'>
                                <h2>Creating skills</h2>
                                <p>To create skills you must ensure that you are in the skills page. In the dashboard choose 'skills' on the left navigation bar. There will appear all your skills or just a <span className='emphasize'>plus button</span> if you have no skills yet. Press the <span className='emphasize'>plus button</span> to go to the skill creation page.</p>
                                <p>When creating a skill you must give it a name to distinguish it from other skills you may want to create. Also you have to add <span className='emphasize'>actions</span> in order to be able to earn <span className='emphasize'>xp</span>. Every <span className='emphasize'>action</span> must have a name and also a value which will be added to your <span className='emphasize'>xp</span> level.</p>
                                <p>Description is an optional field. You may leave it empty, but it may help you to remember what this skill will imply. You may write your goals here to motivate you.</p>
                            </div>
                            <div className='main-section-inner-content' id='editing-and-deleting-skills'>
                                <h2>Editing and deleting skills</h2>
                                <p>From the skills page press any skill card you have to enter its controller (i.e its own page) to be able to work on a skill.</p>
                                <p>Editing a skill is done the same way as with its creation. The same rules apply. To edit a skill enter the skill form page with edit button on the upper right corner on the skill's page.</p>
                                <p>Deleting a skill is done by pressing the delete button on the upper right corner on the skill's page.</p>
                            </div>
                            <div className='main-section-inner-content' id='xp-and-leveling-up'>
                                <h2>XP and leveling up</h2>
                                <p>When you are on the skill's page you can do actions by pressing on them. The action's value you specified when creating the action will be added to your skill's xp amount. Ensure that you complete the action in real life in order to have an effect of using progresser.</p>
                                <p>When your skill's xp amount grows to a certain point, you level up, the skill's xp amount is zeroed (plus the amount that remained from the completed action when leveling up). The threshold from where you level up grows on every new level.</p>
                            </div>
                        </div>
                    </section>
                    <section className='main-section' id='plans-help'>
                        <div className='main-section-header'>
                            <h1>Plans</h1>
                            <hr></hr>
                        </div>
                        <div className='main-section-content'>
                            <div className='main-section-inner-content' id='creating-plans'>
                                <h2>Creating plans</h2>
                                <p>To create plans you must ensure that you are in the plans page. In the dashboard choose 'plans' on the left navigation bar. There will appear all your plans or just a <span className='emphasize'>plus button</span> if you have no plans yet. Press the <span className='emphasize'>plus button</span> to go to the plam creation page.</p>
                                <p>When creating a plan you must give it a name to distinguish it from other plan you may want to create. Also you have to add <span className='emphasize'>tasks</span> in order to be able to complete the plan. Every <span className='emphasize'>task</span> must have a name and different than the other <span className='emphasize'>tasks</span></p>
                                <p>Description is an optional field. You may leave it empty, but it may help you to remember what this skill will imply. You may write your goals here to motivate you.</p>
                            </div>
                            <div className='main-section-inner-content' id='plan-completion-and-editing'>
                                <h2>Plan completion and editing</h2>
                                <p>When completing tasks, your plan completes too. You will see the percentage of its completion on the plan's page. When the plan is completed, its progress bar on the 'plans' page will change color.</p>
                                <p>Editing is done by entering the plan's page and selecting the edit button on the upper right corner. The rulse are the same as with the plan creation with the exception that you cannot edit tasks.</p>
                            </div>
                            <div className='main-section-inner-content' id='deleting-plans'>
                                <h2>Deleting plans</h2>
                                <p>Plan can be deleted by pressing the delete button on the upper right corner of the desired plan's page.</p>
                            </div>
                        </div>
                    </section>
                    <section className='main-section' id='badges-help'>
                        <div className='main-section-header'>
                            <h1>Badges</h1>
                            <hr></hr>
                        </div>
                        <div className='main-section-content'>
                            <div className='main-section-inner-content' id='why-badges'>
                                <h2>Why badges ?</h2>
                                <p>Badges are very important for learning, because they set a clear goal - to earn as many badges as you can. It is a motivational factor that increases your productivity and helps you stay motivated for a long period of time. Every earned badge will boost your confidence level and will make you happy, because you won something that shows that you worked hard. Every badge is built with this idea in mind. There are badges that motivates you to keep on going, to start something new etc. Moreover, badges have different ranks. The higher the rank, the harder it is to earn it. Every badge will add to your <span className='emphasize'>user points</span>.</p>
                            </div>
                            <div className='main-section-inner-content' id='earning-badges'>
                                <h2>Earning badges</h2>
                                <p>Every badge has a condition that must be met in order to earn it. On the <span className='emphasize'><a href='#what-badges-can-i-earn'>what badges can I earn</a></span> section there is a table that shows every condition for the first rank of every badge. Earning a badge will give you points depending on its <span className='emphasize'>rank</span>. Look at the table from the <span className='emphasize'><a href='#what-badges-can-i-earn'>what badges can I earn</a></span> section to learn more.</p>
                            </div>
                            <div className='main-section-inner-content' id='ranking-system'>
                                <h2>Ranking system</h2>
                                <p>A ranking system is a method to motivate you into pursuing your goals. There are 4 ranks for badges, each one being harder to earn than the previous one. In the table below you can look up how many <span className='emphasize'>points</span> each type of badge gives you when you earn it.</p>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td id='rank-common'>Common</td>
                                            <td>15</td>
                                        </tr>
                                        <tr>
                                            <td id='rank-rare'>Rare</td>
                                            <td>25</td>
                                        </tr>
                                        <tr>
                                            <td id='rank-honored'>Honored</td>
                                            <td>50</td>
                                        </tr>
                                        <tr>
                                            <td id='rank-legendary'>Legendary</td>
                                            <td>100</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className='main-section-inner-content' id='what-badges-can-i-earn'>
                                <h2>What badges can I earn ?</h2>
                                <p>Here is a list of all the badges you can earn along with what you need to do in order to earn them. Each condition applies to the common <span className='emphasize'>rank</span> (i.e. the first rank of the badge). On every new badge ranked higher the condition will be harder and harder. Explore those while you approach your goals by earning these badges.</p>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Icon</th>
                                            <th>Name</th>
                                            <th>Earning condition</th>
                                        </tr>
                                    </thead>
                                    <tbody>{badgesList}</tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                    <section className='main-section' id='faq'>
                        <div className='main-section-header'>
                            <h1>F.A.Q</h1>
                            <hr></hr>
                        </div>
                        <div className='main-section-content'>
                            <h3>Why do I need an account ?</h3>
                            <p>&nbsp;&nbsp;An account gives the ability to create skills, plans, earn badges, points and have a rank.</p><br />
                            <h3>What is the role of user points, rank and badges ?</h3>
                            <p>&nbsp;&nbsp;All these help you stay motivated.</p><br />
                            <h3>How to earn points and ranks ?</h3>
                            <p>&nbsp;&nbsp;You earn points by earning xp from skills, completing plans and earning badges. The more points you have the higher your rank will be.</p><br />
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}

function Dropdown({ content={} }) {
    let [dropdownVisible, setDropdownVisibility] = useState(false)
    let links = []

    content.links.forEach((link, i) => links.push(<p key={i}><a href={link.href}>{link.text}</a></p>))

    return (
        <div className='dropdown'>
            <p className='dropdown-header' onClick={() => setDropdownVisibility(!dropdownVisible)}>
                <span>
                    {content.header}
                    <span className={`triangle ${ dropdownVisible ? 'triangle-rotated' : '' }`}>&#9650;</span>
                </span>
            </p>
            <div className={`dropdown-content ${ dropdownVisible ? '' : 'display-none' }`}>{links}</div>
        </div>
    )
}