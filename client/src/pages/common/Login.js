/**
 * Log In function
 */
import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../misc/AuthContext";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthState } = useContext(AuthContext);

  let navigate = useNavigate();

  /* This will be different from the blog auth context because we will include the user role */
  const login = () => {
    const user = { email: email, password: password };
    axios.post("/auth/login", user).then(res => {
      if(res.data.error) {
          alert(res.data.error);
      } else {
        localStorage.setItem("accessToken", res.data.accessToken);
        setAuthState(res.data.role);
        navigate('/');
      }
    });
  };
  return (
    <div className="loginContainer">
      <label>email:</label>
      <input
        type="text"
        onChange={event => {
          setEmail(event.target.value);
        }}
      />
      <label>Password:</label>
      <input
        type="password"
        onChange={event => {
          setPassword(event.target.value);
        }}
      />

      <button onClick={login}> Login </button>
    </div>
  );
}

export default Login;
