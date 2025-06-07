import React, { createContext, useEffect,useReducer } from 'react';

export const AuthContext = createContext();
export const authReducer = (state,action) => {
  switch (action.type){
    case 'signup' :
      return{
        user: action.payload,
        isAuthenticated:false,
      }
    case 'login':
      return {
        userLogin: action.payload,
        isAuthenticated:true,
        isEdited:false,
      }
    case 'profileEdit' :
      return{
        isEdited:true,
        updatedUser:action.payload,
      }
    case 'logout':
      return {
        user:null,
        userLogin:null,
        isAuthenticated:false,
      }
    // default:
    //   return state
  }
}
export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    userLogin:null,
    isAuthenticated: false,
  });
  
  useEffect(()=>{
    const user = JSON.parse(localStorage.getItem('user'))
    if(user){
      dispatch({type : 'login', payload: user})
    }
  },[])
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  }, [state.user]);

  console.log('AuthContext state', state);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
