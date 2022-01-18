import {useState, useEffect} from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';


function GetAuth({children}) {
const [authState, setAuthState] = useState(false);
const [authRole, setAuthRole] = useState("");
    
    /* authorization */

useEffect(()=>{
  axios.post("/users/auth", {}, {
    headers: {
      accessToken: localStorage.getItem("accessToken")
    }
  }).then(res => {
    setAuthState(true);
    
    if(res.data.role){
      setAuthRole(res.data.role);
    } else {
      setAuthState(false);
      setAuthRole(null)
    }
  }).catch(err => {
    // console.log(err.response.data.error);
    setAuthState(false);
    setAuthRole(null);
  });
}, []);
 
  return (
    <AuthContext.Provider value={{authState, setAuthState, authRole, setAuthRole}}>
      {children}
    </AuthContext.Provider>
  )
}
export default GetAuth;

