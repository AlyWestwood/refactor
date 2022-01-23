/**
 * Client registration
 */
 import React, { useState} from "react";
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';


function Register() {

  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState("");

    const initialValues = {
        firstName: "",
        lastName: "",
        phone: "",
        birthdate: "",
        sin: "",
        email: "",
        password: ""
    };

    const validationSchema = yup.object().shape({
        firstName: yup.string().min(2).max(100).required(),
        lastName: yup.string().min(2).max(100).required(),
        phone: yup.string().matches(/[0-9]{10}/, "phone must be exactly 10 digits").required(),
        birthdate: yup.date().required(),
        sin: yup.string().matches(/[0-9]{9}/, "sin must be exactly 9 digits").required(),
        email: yup.string().email().required(),
        password: yup.string().min(4).max(50).required(),
        confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required()
    });

    const onSubmit = newUser => {
      setAlert("");
      setSuccess("");
        axios.post("/users/register", newUser).then(res => {
          console.log(res.data);
          navigate('/login');
        }).catch(err => {
          console.log(err.response.data);
          setAlert(err.response.data);
        });
    };

    const navigate = useNavigate();

    return (
        <div className='col-8 card'>
          <div className='card-header'>Register</div>
          {alert && (
        <div className="alert alert-danger" role="alert">
          {alert}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          <Form className="formContainer card-body">
            <Row className='mb-3'>

            <Col>
            <label className='form-label'>First Name: </label>
            <Field
              className="inputNewEntry form-control"
              name="firstName"
              type="text"
              placeholder="(Ex. Jane)"
            />
            <ErrorMessage name="firstName" render={msg => <span class="text-danger">{msg}</span>} />
            </Col>

            <Col>
            <label className='form-label'>Last Name: </label>
            <Field
              className="inputNewEntry form-control"
              name="lastName"
              type="text"
              placeholder="(Ex. Doe)"
            />
            <ErrorMessage name="lastName" render={msg => <span class="text-danger">{msg}</span>} />
            </Col>
            </Row>
            <Row className='mb-3'>
            <Col>
            <label className='form-label'>Phone: </label>
            <Field
              className="inputNewEntry form-control"
              name="phone"
              type="phone"
              placeholder="(Ex. 5147920067)"
            />
            <ErrorMessage name="phone" render={msg => <span class="text-danger">{msg}</span>} />
            </Col>
            <Col>
            <label className='form-label'>Birthdate: </label>
            <Field
              className="inputNewEntry form-control"
              name="birthdate"
              type="date"
            />
            <ErrorMessage name="birthdate" render={msg => <span class="text-danger">{msg}</span>} />
            </Col>
            </Row>
            <Row className='mb-3'>
            <Col>
            <label className='form-label'>SIN: </label>
            <Field
              className="inputNewEntry form-control"
              name="sin"
              type="text"
              placeholder="(Ex. 086254963)"
            />
            <ErrorMessage name="sin" render={msg => <span class="text-danger">{msg}</span>} />
            </Col>
            
            <Col>
            <label className='form-label'>Email: </label>
            <Field
              className="inputNewEntry form-control"
              name="email"
              type="email"
              placeholder="(Ex. jane@me.com)"
            />
            <ErrorMessage name="email" render={msg => <span class="text-danger">{msg}</span>} />
            </Col>
            </Row>
            <Row className='mb-3'>
              
            <Col>
            <label className='form-label'>Password: </label>
            <Field
              type="password"
              className="inputNewEntry form-control"
              name="password"
              placeholder="Enter your password..."
            />
            <ErrorMessage name="password" render={msg => <span class="text-danger">{msg}</span>} />
            </Col>
            <Col>
            <label className='form-label'>Confirm Password</label>
            <Field
              type="password"
              className="inputNewEntry form-control"
              name="confirmPassword"
              placeholder="Type your password again"
            />
            <ErrorMessage name="confirmPassword" render={msg => <span class="text-danger">{msg}</span>} />
            </Col>
            </Row>
            <button type="submit" className='btn btn-primary'> Register</button>
          </Form>
        </Formik>
      </div>    )
}


export default Register;
