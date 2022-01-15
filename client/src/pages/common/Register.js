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
        SIN: "",
        email: "",
        password: ""
    };

    const validationSchema = yup.object().shape({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        phone: yup.string().required(),
        birthdate: yup.date().required(),
        SIN: yup.string(9).required(),
        email: yup.string().min(3).max(20).required(),
        password: yup.string().min(4).max(20).required()
    });

    const onSubmit = newUser => {
        axios.post("/auth", newUser).then(res => {
          console.log(res.data);
          navigate('/login');
        });
    };

    const navigate = useNavigate();

    return (
        <div>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          <Form className="formContainer">
            <label>First Name: </label>
            <ErrorMessage name="firstName" component="span" />
            <Field
              className="inputNewEntry"
              name="firstName"
              type="text"
              placeholder="(Ex. Jane)"
            />

            <label>Last Name: </label>
            <ErrorMessage name="lastName" component="span" />
            <Field
              className="inputNewEntry"
              name="lastName"
              type="text"
              placeholder="(Ex. Doe)"
            />

            <label>Email: </label>
            <ErrorMessage name="phone" component="span" />
            <Field
              className="inputNewEntry"
              name="phone"
              type="phone"
              placeholder="(Ex. John123...)"
            />

            <label>Email: </label>
            <ErrorMessage name="birthdate" component="span" />
            <Field
              className="inputNewEntry"
              name="birthdate"
              type="date"
            />

            <label>Phone: </label>
            <ErrorMessage name="SIN" component="span" />
            <Field
              className="inputNewEntry"
              name="SIN"
              type="text"
              placeholder="(Ex. John123...)"
            />

            <label>Email: </label>
            <ErrorMessage name="email" component="span" />
            <Field
              className="inputNewEntry"
              name="email"
              type="email"
              placeholder="(Ex. John123...)"
            />
  
            <label>Password: </label>
            <ErrorMessage name="password" component="span" />
            <Field
              type="password"
              className="inputNewEntry"
              name="password"
              placeholder="Your Password..."
            />
  
            <button type="submit"> Register</button>
          </Form>
        </Formik>
      </div>    )
}

export default Register;
