/**
 * Component for displaying accounts on the client accounts overview page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, ListGroup, Row, Col } from 'react-bootstrap';
import { reqHeader } from '../misc/reqHeader';
import { assignTransaction, getSymbol } from '../misc/accountUtils';

function DisplayAccounts({account}){
    const [transactionList, setTransactionList] = useState([]);
    const navigate = useNavigate();
    const currency = getSymbol(account.currency);

    
    useEffect(() => {
        axios.get(`/transactions/byAccount/${account.id}`, reqHeader)
        .then(res => {
            if(res.data.length > 5){
                setTransactionList(res.data.slice(0,5));
            }else{
             
            setTransactionList(res.data);   
            }
            // console.log(transactionList)
        })
    }, [account]);
    
    
    return (
        <>
         <Card className='m-3' key={account.id} onClick={() => navigate(`/client/accounts/${account.id}`)} >
            <Card.Header className='text-start h5'><Row><Col className=''>{account.accountType === 'debit' ? 'Debit' : 'Credit'} - {account.currency}</Col><Col className='text-end'>Account #: {account.id}</Col></Row></Card.Header>
            <Card.Body>
                <Card.Title className='text-end'>Balance: {currency}{account.balance}</Card.Title>
                {transactionList.length === 0 && <div>No transactions</div>}
            </Card.Body>
            {transactionList.length > 0 && 
                <ListGroup>
                    {transactionList.map(transaction => {
                        return (
                            <ListGroup.Item key={'transaction'+transaction.id}>
                                    {assignTransaction(transaction, account.id)}
                            </ListGroup.Item>
                            )})}
                            <ListGroup.Item><div className='text-primary'>{transactionList.length} total transactions</div></ListGroup.Item>
                </ListGroup>}
        </Card>
        </>
    )
}


// function parseDate(date){
//     const formatDate = new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true});
//     let dateObject = new Date(Date.parse(date));
//     return formatDate.format(dateObject);

// }

// function assignTransaction(transaction, accountId){
//     if(transaction.payerAccount === accountId){
//         //do stuff
//         //outgoing transaction
//         //minus
//         return <><Row><Col className='text-start'>{parseDate(transaction.createdAt)} : paid to #{transaction.payeeAccount}</Col><Col sm={3} className='text-end'>-${transaction.originValue} {transaction.originCurrency}</Col></Row></>;
//     } else if (transaction.payeeAccount === accountId){
//         return <><Row><Col className='text-start'>{parseDate(transaction.createdAt)} : received from #{transaction.payerAccount}</Col><Col sm={3} className='text-end'>${transaction.targetValue} {transaction.targetCurrency}</Col></Row></>;
//     } else {
//         return "error";
//     }
// }


export default DisplayAccounts