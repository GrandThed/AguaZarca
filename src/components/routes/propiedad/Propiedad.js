import React from 'react'
import {useParams} from 'react-router-dom'

const Propiedad = () => {
    const {id} = useParams()
    return (
        <div>
            {id}
        </div>
    )
}

export default Propiedad
