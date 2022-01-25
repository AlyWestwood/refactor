/**
 * Log In function
 */
import React, { useState, useContext } from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../../misc/AuthContext";
import { Form, Card, Button, Alert } from 'react-bootstrap';


function Login() {
  let navigate = useNavigate();
  const { setAuthState, setAuthUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState("");


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
        navigate('/dashboard');
      }
    }).catch(err => {
      setAlert(err.response.data.error)
    });
  };
  return (
    <>
    <Card className='col-5'>
      <Card.Header>Log In</Card.Header>
      <Card.Body>
        {alert && (
            <Alert variant='danger' onClose={() => setAlert("")} dismissible>
            {alert}
            </Alert>
        )}
        {success && (
            <Alert variant='success' onClose={() => setSuccess("")} dismissible>
            {success}
            </Alert>
        )}

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
