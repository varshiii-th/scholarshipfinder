import React, { useState } from 'react'
 import { BrowserRouter,Routes,Route } from 'react-router-dom'
 import useLocalStorage from 'use-local-storage'
import Home from './pages/Home/Home'
import Login from './pages/LoginPage/Login'
import Nav from './components/Nav/Nav'
import Signup from './pages/SignupPage/Signup'
import Footer from './components/Footer/Footer'
import Toggle from './components/Toggle/Toggle'
import Profile from './pages/ProfilePage/Profile'
import Scholarship from './pages/Main/fulldetails'
import './App.css'
import { useAuthContext } from './hooks/useAuthContext'
import axios from 'axios'
import Verification from './pages/Verification/Verification'
import TwoTabs from './pages/Main/Main'
axios.defaults.baseURL = 'http://localhost:8008';
axios.defaults.withCredentials = true

const App = () => {
  const {isAuthenticated} = useAuthContext()
  const [isLight,setIsLight] = useLocalStorage("isLight",false)
  const toggleTheme = () => {
    setIsLight(!isLight)
  }
  return (
    <BrowserRouter>
    {/* cutom id-preferences for app */}
      <div className="App" data-theme={isLight ? "light" : "dark"} >
      <Toggle handleChange = {toggleTheme} isChecked ={isLight}/>
      <Nav/>
      
      <Routes>
        <Route path='/' element={<Home/>}/>

        <Route path='/signin' element={<Login/>}/> 
        <Route path='/signup' element={<Signup />}/>
        <Route path='/verification' element={<Verification/>}/>
        <Route path='/main' element={<TwoTabs/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/scholarship/:id' element={<Scholarship/>}/>

      </Routes>
    
        <Footer />  
      </div>
    
    </BrowserRouter>
  
  )
}

export default App

