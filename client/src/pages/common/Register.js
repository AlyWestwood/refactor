/**
 * Client registration
 */
import React from 'react';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Register() {
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
        firstName: yup.string().min(3).max(100).required(),
        lastName: yup.string().min(3).max(100).required(),
        phone: yup.string().required(),
        birthdate: yup.date().required(),
        sin: yup.string(9).required(),
        email: yup.string().min(3).max(20).required(),
        password: yup.string().min(4).max(20).required()
    });

    const onSubmit = newUser => {
        axios.post("/users/register", newUser).then(res => {
          console.log(res.data);
          navigate('/login');
        });
    };

    const navigate = useNavigate();

    return (
        <div className='col-5'>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          <Form className="formContainer">
            <div className='mb-3'>
            <label className='form-label'>First Name: </label>
            <ErrorMessage name="firstName" component="span" />
            <Field
              className="inputNewEntry form-control"
              name="firstName"
              type="text"
              placeholder="(Ex. Jane)"
            />
            </div>

            <div className='mb-3'>
            <label className='form-label'>Last Name: </label>
            <ErrorMessage name="lastName" component="span" />
            <Field
              className="inputNewEntry form-control"
              name="lastName"
              type="text"
              placeholder="(Ex. Doe)"
            />
            </div>
            
            <div className='mb-3'>
            <label className='form-label'>Phone: </label>
            <ErrorMessage name="phone" component="span" />
            <Field
              className="inputNewEntry form-control"
              name="phone"
              type="phone"
              placeholder="(Ex. John123...)"
            />
            </div>
            
            <div className='mb-3'>

            <label className='form-label'>Birthdate: </label>
            <ErrorMessage name="birthdate" component="span" />
            <Field
              className="inputNewEntry form-control"
              name="birthdate"
              type="date"
            />
            </div>
            
            <div className='mb-3'>
            <label className='form-label'>SIN: </label>
            <ErrorMessage name="SIN" component="span" />
            <Field
              className="inputNewEntry form-control"
              name="sin"
              type="text"
              placeholder="(Ex. John123...)"
            />
            </div>
            
            <div className='mb-3'>
            <label className='form-label'>Email: </label>
            <ErrorMessage name="email" component="span" />
            <Field
              className="inputNewEntry form-control"
              name="email"
              type="email"
              placeholder="(Ex. John123...)"
            />
            </div>
            
            <div className='mb-3'>
            <label className='form-label'>Password: </label>
            <ErrorMessage name="password" component="span" />
            <Field
              type="password"
              className="inputNewEntry form-control"
              name="password"
              placeholder="Your Password..."
            />
            </div>

            <button type="submit" className='btn btn-primary'> Register</button>
          </Form>
        </Formik>
      </div>    )
}

export default Register;
