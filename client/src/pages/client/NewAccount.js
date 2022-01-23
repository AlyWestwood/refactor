/**
 * Open a new banking account
 */
import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { reqHeader } from '../../misc/reqHeader';

function NewAccount() {
    const [alert, setAlert] = useState("");
    const [success, setSuccess] = useState("");
  
const navigate = useNavigate();

    const createAccount = submit => {
        submit.preventDefault();
        var account = {
            accountType: submit.target.type.value,
            currency: submit.target.currency.value
        }
        console.log(account);
        axios.post('/accounts/createAccount', account, reqHeader).then(res => {
            setSuccess(res.data.message);
            submit.target.reset();
        }).catch(err => {
            setAlert(err.response ? err.response.data.error : 'There was an error processing your request')
        });
    }

    return (
        <>
        <Card className='col-5 m-3'>
            <Card.Header >Create a New Account</Card.Header>
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
                <Form onSubmit={createAccount}>
                    <Form.Group className='mb-3' controlId='type'>
                        <Form.Label>Account Type</Form.Label>
                        <Form.Select name='type' defaultValue={'null'}>
                            <option value='null' disabled>Select</option>
                            <option value='debit'>Debit</option>
                            <option value='credit'>Credit</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className='mb-3' controlId='currency'>
                        <Form.Label>Currency</Form.Label>
                        <Form.Select name='currency' defaultValue={'null'}>
                            <option value='null' disabled>Select</option>
                            <option value='CAD'>$ CAD</option>
                            <option value='USD'>$ USD</option>
                            <option value='EUR'>€ EUR</option>
                            <option value='GBP'>£ GBP</option>
                        </Form.Select>
                    </Form.Group>
                    <Button variant='primary' className='mx-3' type='submit'>Submit</Button>
                    <Button variant='secondary' className='mx-3' type='reset'>Reset</Button>
                </Form>
            </Card.Body>
        </Card>
        </>
    )
}

export default NewAccount
