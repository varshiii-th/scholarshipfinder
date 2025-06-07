import { useState } from "react"
import { useAuthContext } from "./useAuthContext"
import { useNavigate } from "react-router-dom"


export const useLogin = () => {
  const [error,setError] = useState(null)
  const navigate = useNavigate()
  const {dispatch,user} = useAuthContext()
  const login = async (user) => {
    setError(null)
    const response = await fetch('/user/signin',{
      method:'POST',
      headers: {'Content-Type': 'application/json'},
      body:JSON.stringify(user)
    })
    const text = await response.text();
    const userResponse = text ? JSON.parse(text) : {};

    if(userResponse.status!="Failed"){
      localStorage.setItem("user",JSON.stringify(userResponse))
      console.log(userResponse)
      dispatch({type:'login',payload:userResponse})
      
      navigate("/main",{replace:true});
    }else{
      alert(`${userResponse.message}`)
    }
  }
  return { login,error}

}