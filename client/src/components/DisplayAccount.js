/**
 * Component for displaying accounts on the account details page
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, ListGroup, Row, Col, Modal, Table, Button } from 'react-bootstrap';
import { reqHeader } from '../misc/reqHeader';
import { assignTransaction, getSymbol, parseDateTime } from '../misc/accountUtils';
import { useNavigate } from 'react-router-dom';



function DisplayAccount({account}){
    const [transactionList, setTransactionList] = useState([]);
    const [showModal, setShowModal] = useState([]);
    const [paginate, setPaginate] = useState("");
    const [page, setPage] = useState(0);
    const [cheque, setCheque] = useState(false);
    const navigate = useNavigate();
    
    const currency = getSymbol(account.currency)

    function RenderPages() {
        let pages = [];
        if (paginate.currentPage > 1) {
          pages.push(
            <li className="page-item">
              <a className="page-link" onClick={() => {setPage(paginate.currentPage - 1);}}>
                Previous
              </a>
            </li>
          );
        } else {
          pages.push(
            <li className="page-item disabled">
              <a className="page-link " onClick={() => {setPage(paginate.currentPage - 1);}}>
                Previous
              </a>
            </li>
          );
        }
        for (let i = 1; i < paginate.totalPages + 1; i++) {
          if (i === paginate.currentPage) {
            pages.push(
              <li className="page-item active">
                <a className="page-link" onClick={() => {setPage(i);}}>
                  {i}
                </a>
              </li>
            );
          } else {
            pages.push(
              <li className="page-item">
                <a className="page-link" onClick={() => {setPage(i);}}>
                  {i}
                </a>
              </li>
            );
          }
        }
        if (paginate.currentPage !== paginate.endPage) {
          pages.push(
            <li className="page-item">
              <a className="page-link"  onClick={() => {setPage(Number(paginate.currentPage) + 1);}}>
                Next
              </a>
            </li>
          );
        } else {
          pages.push(
            <li className="page-item disabled">
              <a className="page-link " onClick={() => {setPage(Number(paginate.currentPage) + 1);}}>
                Next
              </a>
            </li>
          );
        }
        return <ul className="pagination m-3 justify-content-center">{pages}</ul>;
      }
    
    useEffect(() => {
        axios.get(`/transactions/byAccountPage/${account.id}?page=` + page, reqHeader)
        .then(res => {
            setTransactionList(res.data.pageOfTransactions);
            setPaginate(res.data.pager);
            // console.log(transactionList)
        })
    }, [account, page]);

    const getCheque = function(chequeId){
        setShowModal([]);
        setCheque(chequeId);
    }
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
                            action
                            onClick={() =>{
                                setShowModal(transaction.id)
                            }}>
                                {assignTransaction(transaction, account.id)}
                        </ListGroup.Item>
                        )})}
            </ListGroup>}
            <RenderPages />
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
                                <td>{parseDateTime(transaction.transactionDate)}</td>
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
                                <td><Button variant='outline-primary' onClick={() => getCheque(transaction.chequeId)}>View Cheque</Button></td>
                            </tr>}
                            
                            <tr>
                                <th>Recurring Payment</th>
                                <td>{transaction.recurringPaymentId ? 'Yes' : 'No'}</td>
                            </tr>
                            {transaction.recurringPaymentId &&
                                <Button variant='outline-primary' className='mt-3' onClick={() => navigate(`/client/recurringpayment/${transaction.payerAccount}`)}>View Payment Schedule</Button> 
                            }
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>
        )})}

        <Modal
                size = 'lg'
                show = { cheque }
                onHide = {() => setCheque(false)}
                centered
                >
            <img src={`http://localhost:3001/transactions/cheques/${cheque}/${localStorage.getItem('accessToken')}`} alt='cheque'/>
        </Modal>
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