/**
 * Log In function
 */
import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../misc/AuthContext";


function Login() {
  let navigate = useNavigate();
  const { setAuthState, setAuthRole } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* This will be different from the blog auth context because we will include the user role */
  const login = () => {
    const user = { email: email, password: password };
    axios.post("/users/login", user).then(res => {
      if(res.data.error) {
          alert(res.data.error);
      } else {
        localStorage.setItem("accessToken", res.data.token);
        setAuthState(true);
      
        setAuthRole(res.data.role);
        navigate('/');
      }
    });
  };
  return (
    <div className="col-3 p-3">
      <div className="mb-3">
      <label className="form-label">email:</label>
      <input
        type="text"
        onChange={event => {
          setEmail(event.target.value);
        }}
        className="form-control"
      />
      </div>
      <div className="mb-3">
      <label className="form-label">Password:</label>
      <input
        type="password"
        onChange={event => {
          setPassword(event.target.value);
        }}
        className="form-control"
      />
      </div>
      <button onClick={login} className="btn btn-primary"> Login </button>
    </div>
  );
}

function Logout(){
    // let navigate = useNavigate();
    const { setAuthState, setAuthRole } = useContext(AuthContext);


    localStorage.removeItem("accessToken");
    setAuthState(false);
    setAuthRole(null);
    
    return null;
}

export { Login, Logout };
