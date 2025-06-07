import React from 'react'
import './Toggle.css'
const Toggle = ({handleChange,isChecked}) => {
  
  return (
    <div className='toggle-container'>
      <input 
        className='toggle'
        id='check'
        type="checkbox"
        onChange={handleChange}
        checked={isChecked}
      />
      <label htmlFor='check'>
        {isChecked ? <p className='light'>Light mode</p> : <p className='dark'>Dark mode</p>}
      </label>
    </div>
  )
}

export default Toggle
