import React, { useState, useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { GiHamburgerMenu } from "react-icons/gi"
import './Nav.css'
import { useLogout } from '../../hooks/useLogout'
import { useAuthContext } from '../../hooks/useAuthContext'

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { logout } = useLogout()
  const { isAuthenticated, userLogin } = useAuthContext()

  const handleLogOut = () => {
    logout()
  }

  return (
    <div className="nav-bar">
      <div className="logo">
        <NavLink to='/'><h1>Scholarship<span>Finder</span></h1></NavLink>
      </div>
      <div className="hamburger-menu" onClick={() => { setMenuOpen(!menuOpen); }}>
        <a href="#"><GiHamburgerMenu /></a>
      </div>
      
      <ul className={menuOpen ? "open" : ""}>
        {
          isAuthenticated ? 
            <>
              <li><NavLink to='/signin' onClick={handleLogOut}>Logout</NavLink></li>
              <li><NavLink to='/profile'>{userLogin?.result?.username || 'Profile'}</NavLink></li>
              <li><NavLink to='/main'>Details</NavLink></li>
            </>
          :
            <>
              <li><NavLink to='/signin'>Login</NavLink></li>
              <li><NavLink to='/signup'>Signup</NavLink></li>
            </>
        }
      </ul>
    </div>
  )
}
export default Nav