import React,{useContext,useState} from 'react'
import { useNavigate,NavLink} from 'react-router-dom'
import { FaUser,FaLock } from "react-icons/fa"
import { useLogin } from '../../hooks/useLogin'
import styles from './Login.module.css'
import { useAuthContext } from '../../hooks/useAuthContext'


const Login = () => {
  const navigate = useNavigate();
  const {user} = useAuthContext()
  const {login ,error} = useLogin()
  const [user1,setUser] = useState({
    username:"",
    password:"",
  });
  const handleInput=(e)=>{
    let name = e.target.name;
    let value = e.target.value;
    setUser({...user1,
      [name]:value,
    })
  };
  const handleSubmit= async (e)=>{
    e.preventDefault();
    await login(user1)
    
  };

  return (
    <section className={styles.sectionForm}>
        
        <div className={styles.wrapper}>
          <h1>LOGIN</h1>
          <form onSubmit={handleSubmit} action="">
            <div className={styles.inputBox}>
              <input name="username" className={styles.input} type="text" placeholder='Username' required onChange={handleInput} value={user1.username} />
              <FaUser className={styles.icon}/>
            </div>
            <div className={styles.inputBox}>
              <input name="password" type="password" placeholder='Password' required onChange={handleInput} value={user1.password} />
              <FaLock className={styles.icon} />
            </div>
        
              <button type="submit" className={styles.loginButton}>Login</button>
            
            <div className={styles.registerLink}>
              <p>Don't have an account? <NavLink to='/signup'>Signup</NavLink></p>
            </div>
            {error && <div className='error'>{error}</div>}
          </form>
        </div>
       
    
     
    </section>
     
    
  )
}

export default Login

