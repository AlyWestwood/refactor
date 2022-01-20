/**
 * View account info for client
 */

import React, {useEffect, useState} from 'react';
import {Link, useContext } from 'react-router-dom';
import { Card, Col, Row, ListGroup } from 'react-bootstrap'
import axios from 'axios';
import { reqHeader } from '../../misc/reqHeader';

function DisplayAccount({value}){
    const [transactionList, setTransactionList] = useState([]);
    
    useEffect(() => {
        axios.get(`/transactions/byAccount/${value.id}`, reqHeader)
        .then(res => {
            console.log(res.data);
            setTransactionList(res.data);
            // console.log(transactionList)
        })
    }, [value]);
    
    console.log(transactionList);
    return (
        <>
        <Card className='m-3' key={value.id}>
            <Card.Header className='text-start h5'><Row><Col className=''>{value.accountType === 'debit' ? 'Debit' : 'Credit'}</Col><Col className='text-end'>Account #: {value.id}</Col></Row></Card.Header>
            <Card.Body>
                <Card.Title className='text-end'>Balance: ${value.balance}</Card.Title>
                {transactionList.length === 0 && <div>No transactions</div>}
            </Card.Body>
            <ListGroup>
                {transactionList.map(transaction => {
                    return (
                        <ListGroup.Item key={transaction.id}>{assignTransaction(transaction, value.id)}</ListGroup.Item>
                        )})}
            </ListGroup>
        </Card>
        </>
    )
}

function parseDate(date){
    const formatDate = new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true});
    let dateObject = new Date(Date.parse(date));
    return formatDate.format(dateObject);

}

function assignTransaction(transaction, accountId){
    if(transaction.payerAccount === accountId){
        //do stuff
        //outgoing transaction
        //minus
        return <><Row><Col className='text-start'>{parseDate(transaction.createdAt)} : paid to #{transaction.payeeAccount}</Col><Col sm={3} className='text-end'>-${transaction.originValue} {transaction.originCurrency}</Col></Row></>;
    } else if (transaction.payeeAccount === accountId){
        return <><Row><Col className='text-start'>{parseDate(transaction.createdAt)} : received from #{transaction.payerAccount}</Col><Col sm={3} className='text-end'>${transaction.targetValue} {transaction.targetCurrency}</Col></Row></>;
    } else {
        return "error";
    }
}

function Account() {
    const [accountList, setAccountList] = useState([]);
    const [totalDebit, setTotalDebit] = useState();
    const [totalCredit, setTotalCredit] = useState(0);

    useEffect(() => {
        axios.get('/accounts/getAccounts', reqHeader).then(res => {
            setAccountList(res.data.listOfAccounts);
            let debit = 0;
            for(var account in res.data.listOfAccounts){
                if(account.accountType === 'debit'){
                    debit += account.balance
                }
            }
            setTotalDebit(debit);
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
  
        </Col>
        <Col>
            <Card className='m-3 sticky-top text-end'>
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
                    <ListGroup.Item>Total debit: ${totalDebit}</ListGroup.Item>
                    <ListGroup.Item>Total credit</ListGroup.Item>
                </ListGroup>
            </Card>
        </Col>
        </>
    )
}

export default Account
