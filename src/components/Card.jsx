import React from 'react'

const Card = ({ title, content, toggleCard }) => {
  return (
    <div className='card-container'>
        <h4>{ title }</h4>
        <div>
            { content }
            <button className='exit-button' onClick={toggleCard}>Exit</button>
        </div>
        
    </div>
  )
}

export default Card