import React from 'react'
import { BrowserRouter, Link } from 'react-router-dom'

import './AddButton.css'

// element prop denotes the element to add (skill, plan)
export default function AddButton({ element }) {
    return (
        <Link to={`/dashboard/${element}s/add`}>
            <button id='dashboard-add-button'></button>
        </Link>
    )
}