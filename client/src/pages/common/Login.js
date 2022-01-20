/**
 * Log In function
 */
import React, { useState, useContext } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../../misc/AuthContext";
import { Form, Card, Button } from 'react-bootstrap';


function Login() {
  let navigate = useNavigate();
  const { setAuthState, setAuthUser } = useContext(AuthContext);
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
        setAuthUser(res.data.user);
        navigate('/');
      }
    }).catch(err => {
      alert(err.response.data.error)
    });
  };
  return (
    // <div className="col-5 card">
    //   <div className="card-header">Log In</div>
    //   <div className="card-body">
    //   <div className="mb-3">
    //   <label className="form-label">email:</label>
    //   <input
    //     type="text"
    //     onChange={event => {
    //       setEmail(event.target.value);
    //     }}
    //     className="form-control"
    //   />
    //   </div>
    //   <div className="mb-3">
    //   <label className="form-label">Password:</label>
    //   <input
    //     type="password"
    //     onChange={event => {
    //       setPassword(event.target.value);
    //     }}
    //     className="form-control"
    //   />
    //   </div>
    //   <button onClick={login} className="btn btn-primary"> Login </button>
    //   </div>
    // </div>
    <>
    <Card className='col-5'>
      <Card.Header>Log In</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group controlId='email' className='mb-3'>
            <Form.Label>Email</Form.Label>
            <Form.Control type='email' onChange={event => {setEmail(event.target.value);}} placeholder="example@email.com" />
          </Form.Group>
          <Form.Group controlId='password' className='mb-3'>
            <Form.Label>Password</Form.Label>
            <Form.Control type='password' onChange={event => {setPassword(event.target.value);}} />
          </Form.Group>
          <Button variant='primary' onClick={login}>Log In</Button>
        </Form>
      </Card.Body>
    </Card>
    </>
  );
}

function Logout(){
    // let navigate = useNavigate();
    // const { setAuthState, setAuthRole } = useContext(AuthContext);


    localStorage.removeItem("accessToken");
    // setAuthState(false);
    // setAuthRole(null);
    
    return (
      <>
      <Navigate to="/login"/>
      </>
    );
}

export { Login, Logout };
