import {useState, useEffect} from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { reqHeader } from './reqHeader';


function GetAuth({children}) {
const [authState, setAuthState] = useState(null);
const [authUser, setAuthUser] = useState({id: null, role: null, status: null});//
    
    /* authorization */

useEffect(()=>{
  axios.post("/users/auth", {}, reqHeader).then(res => {
    setAuthState(true);
    
    if(res.data.user){
      setAuthUser(res.data.user);
    } else {
      setAuthState(false);
      setAuthUser(null)
    }
  }).catch(err => {
    // console.log(err.response.data.error);
    setAuthState(false);
    setAuthUser(null);
  });
}, []);

  return (
    <AuthContext.Provider value={{authState, setAuthState, authUser, setAuthUser}}>
      {children}
    </AuthContext.Provider>
  )
}
export default GetAuth;

