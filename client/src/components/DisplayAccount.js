import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, ListGroup, Row, Col } from 'react-bootstrap';
import { reqHeader } from '../misc/reqHeader';

function DisplayAccount({value}){
    const [transactionList, setTransactionList] = useState([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        axios.get(`/transactions/byAccount/${value.id}`, reqHeader)
        .then(res => {
            setTransactionList(res.data);
            // console.log(transactionList)
        })
    }, [value]);
    
    return (
        <>
        <Card className='m-3' key={value.id} onClick={() => navigate(`${value.id}`)}>
            <Card.Header className='text-start h5'><Row><Col className=''>{value.accountType === 'debit' ? 'Debit' : 'Credit'} - {value.currency}</Col><Col className='text-end'>Account #: {value.id}</Col></Row></Card.Header>
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


export default DisplayAccount