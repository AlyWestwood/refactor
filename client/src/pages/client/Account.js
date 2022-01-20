/**
 * View account info for client
 */

import React, {useEffect, useState} from 'react';
import {Link, useContext } from 'react-router-dom';
import { Card, Col, ListGroup } from 'react-bootstrap'
import axios from 'axios';
import { reqHeader } from '../../misc/reqHeader';

function DisplayAccount({value}){
    const [transactionList, setTransactionList] = useState([]);

    useEffect(() => {
        axios.get(`/transactions/byAccount/${value.id}`, reqHeader)
        .then(res => {
            // console.log(res.data);
            setTransactionList(res.data);
            // console.log(transactionList)
        })
    }, [value]);

    console.log(transactionList);
    return (
        <>
        <Card className='m-3' key={value.id}>
            <Card.Header>{value.id} - {value.accountType}</Card.Header>
            <Card.Body>
                <Card.Title>Balance: {value.balance}</Card.Title>
                {transactionList.length === 0 && <div>No transactions</div>}
            </Card.Body>
            <ListGroup>
                {transactionList.map(transaction => {
                    return (
                    <ListGroup.Item key={transaction.id}>{transaction.originValue} - </ListGroup.Item>
                )})}
            </ListGroup>
        </Card>
        </>
    )
}

function Account() {
    const [accountList, setAccountList] = useState([]);

    useEffect(() => {
        axios.get('/accounts/getAccounts', reqHeader).then(res => {
            setAccountList(res.data.listOfAccounts);
        })
    }, [])


    return (
        <>
        <h1 className='text-start'>Accounts Overview</h1>
        <Col md={9}>
            {accountList.map(account => {
                return (
                    <>
                    <DisplayAccount key={account.id} value = {account} />
                    </>
                )
            })}
  
        {/* <Card className='m-3'>
                <Card.Header>account number</Card.Header>
                <ListGroup>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                </ListGroup>
            </Card>
            <Card className='m-3'>
                <Card.Header>account number</Card.Header>
                <ListGroup>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                </ListGroup>
            </Card>
            <Card className='m-3'>
                <Card.Header>account number</Card.Header>
                <ListGroup>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                </ListGroup>
            </Card>
            <Card className='m-3'>
                <Card.Header>account number</Card.Header>
                <ListGroup>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                </ListGroup>
            </Card> */}
        </Col>
        <Col>
            <Card className='m-3 sticky-top'>
                <Card.Header>
                    words
                </Card.Header>
                <Card.Body>
                    <Link to='/client/openAccount'>Open a new account</Link>
                    <Card.Text>
                        Grand total assets
                    </Card.Text>
                </Card.Body>
                <ListGroup>
                    <ListGroup.Item>Total saving</ListGroup.Item>
                    <ListGroup.Item>Total spending</ListGroup.Item>
                    <ListGroup.Item>Total credit</ListGroup.Item>
                </ListGroup>
            </Card>
        </Col>
        </>
    )
}

export default Account
