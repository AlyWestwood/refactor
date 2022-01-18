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
        firstName: yup.string().min(2).max(100).required(),
        lastName: yup.string().min(2).max(100).required(),
        phone: yup.string().matches(/[0-9]{10}/, "phone must be exactly 10 digits").required(),
        birthdate: yup.date().required(),
        sin: yup.string().matches(/[0-9]{9}/, "sin must be exactly 9 digits").required(),
        email: yup.string().email().required(),
        password: yup.string().min(4).max(50).required()
    });

    const onSubmit = newUser => {
        axios.post("/users/register", newUser).then(res => {
          console.log(res.data);
          navigate('/login');
        }).catch(err => {
          console.log(err.response.data.error);
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
            <Field
              className="inputNewEntry form-control"
              name="firstName"
              type="text"
              placeholder="(Ex. Jane)"
            />
            <ErrorMessage name="firstName" render={msg => <span class="text-danger">{msg}</span>} />
            </div>

            <div className='mb-3'>
            <label className='form-label'>Last Name: </label>
            <Field
              className="inputNewEntry form-control"
              name="lastName"
              type="text"
              placeholder="(Ex. Doe)"
            />
            <ErrorMessage name="lastName" render={msg => <span class="text-danger">{msg}</span>} />
            </div>
            
            <div className='mb-3'>
            <label className='form-label'>Phone: </label>
            <Field
              className="inputNewEntry form-control"
              name="phone"
              type="phone"
              placeholder="(Ex. John123...)"
            />
            <ErrorMessage name="phone" render={msg => <span class="text-danger">{msg}</span>} />
            </div>
            
            <div className='mb-3'>

            <label className='form-label'>Birthdate: </label>
            <Field
              className="inputNewEntry form-control"
              name="birthdate"
              type="date"
            />
            <ErrorMessage name="birthdate" render={msg => <span class="text-danger">{msg}</span>} />
            </div>
            
            <div className='mb-3'>
            <label className='form-label'>SIN: </label>
            <Field
              className="inputNewEntry form-control"
              name="sin"
              type="text"
              placeholder="(Ex. John123...)"
            />
            <ErrorMessage name="sin" render={msg => <span class="text-danger">{msg}</span>} />
            </div>
            
            <div className='mb-3'>
            <label className='form-label'>Email: </label>
            <Field
              className="inputNewEntry form-control"
              name="email"
              type="email"
              placeholder="(Ex. John123...)"
            />
            <ErrorMessage name="email" render={msg => <span class="text-danger">{msg}</span>} />
            </div>
            
            <div className='mb-3'>
            <label className='form-label'>Password: </label>
            <Field
              type="password"
              className="inputNewEntry form-control"
              name="password"
              placeholder="Your Password..."
            />
            <ErrorMessage name="password" render={msg => <span class="text-danger">{msg}</span>} />
            </div>

            <button type="submit" className='btn btn-primary'> Register</button>
          </Form>
        </Formik>
      </div>    )
}


export default Register;
