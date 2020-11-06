import React from 'react'
import logo from './../../images/vcp-panoramica.jpg'
import './pageTitle.css'
export const PageTitle = (props) => {
    return (
        <div className="pagetitle-div" style={{backgroundImage: `url(${logo})`}}>
            <h1>{props.title}</h1>
        </div>
    )
}
