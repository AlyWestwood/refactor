/**
 * Component for displaying accounts on the account details page
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, ListGroup, Row, Col, Modal, Table, Button } from 'react-bootstrap';
import { reqHeader } from '../misc/reqHeader';
import { assignTransaction, getSymbol, parseDate } from '../misc/accountUtils';

function DisplayAccount({account}){
    const [transactionList, setTransactionList] = useState([]);
    const [showModal, setShowModal] = useState([]);
    const navigate = useNavigate();
    
    const currency = getSymbol(account.currency)
    
    useEffect(() => {
        axios.get(`/transactions/byAccount/${account.id}`, reqHeader)
        .then(res => {
            setTransactionList(res.data);
            // console.log(transactionList)
        })
    }, [account]);


    return (
        <>
         <Card className='m-3' > 
            <Card.Header className='text-start h5'><Row><Col className=''>{account.accountType === 'debit' ? 'Debit' : 'Credit'} - {account.currency}</Col><Col className='text-end'>Account #: {account.id}</Col></Row></Card.Header>
            <Card.Body>
                <Card.Title className='text-end'>Balance: {currency}{account.balance}</Card.Title>
                {transactionList.length === 0 && <div>No transactions</div>}
            </Card.Body>
            {transactionList.length > 0 &&
            <ListGroup>
                {transactionList.map(transaction => {
                    return (
                        <ListGroup.Item 
                            key={'transaction'+transaction.id} 
                            onClick={() =>{
                                setShowModal(transaction.id)
                            }}>
                                {assignTransaction(transaction, account.id)}
                        </ListGroup.Item>
                        )})}
            </ListGroup>}
        </Card>

        {transactionList.map(transaction =>{
            return (
            <Modal
                key = {'transactionModal' + transaction.id}
                size = 'lg'
                show = { showModal === transaction.id }
                onHide = {() => setShowModal(false)}
                centered
            >
                <Modal.Header closeButton closeVariant='white' className='bg-secondary text-white'>Transaction # {transaction.id}</Modal.Header>
                <Modal.Body>
                    <Table>
                        <tbody>
                            <tr>
                                <th>Payer Account #</th>
                                <td>{transaction.payerAccount}</td>
                            </tr>
                            <tr>
                                <th>Payee Account #</th>
                                <td>{transaction.payeeAccount}</td>
                            </tr>
                            <tr>
                                <th>Time Stamp</th>
                                <td>{parseDate(transaction.transactionDate)}</td>
                            </tr>
                            <tr>
                                <th>Payer Account Value</th>
                                <td>{getSymbol(transaction.originCurrency)}{transaction.originValue} {transaction.originCurrency}</td>
                            </tr>
                            <tr>
                                <th>Payee Account Value</th>
                                <td>{getSymbol(transaction.targetCurrency)}{transaction.targetValue} {transaction.targetCurrency}</td>
                            </tr>
                            <tr>
                                <th>Status</th>
                                <td>{transaction.status}</td>
                            </tr>

                            {transaction.chequeId && 
                            <tr>
                                <th>Cheque</th>
                                <td><Button variant='outline-primary'>View Cheque</Button></td>
                            </tr>}
                            
                            <tr>
                                <th>Recurring Payment</th>
                                <td>{transaction.recurringPaymentId ? 'Yes' : 'No'}</td>
                            </tr>
                            {transaction.recurringPaymentId &&
                                <Button variant='outline-primary' className='mt-3'>Stop this payment</Button> 
                            }
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>
        )})}
        </>
    )
}


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


export default DisplayAccount