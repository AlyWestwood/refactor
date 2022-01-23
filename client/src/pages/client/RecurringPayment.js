import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Card, ListGroup, Row, Col, Table, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { reqHeader } from '../../misc/reqHeader';
import { AuthContext } from '../../misc/AuthContext';
import { getSymbol, displayDays, parseDate } from '../../misc/accountUtils';


function RecurringPayment() {

    const params = useParams();
    const byAccount = params.accountId ? true : false;
    const [recurringList, setRecurringList] = useState([]);
    const [showDelete, setShowDelete] = useState(false);
    const { authUser } = useContext(AuthContext);
    const [flashMessage, setFlashMessage] = useState(null)

    useEffect(() => {
        axios.get(byAccount ? `/transactions/recurringPayments/${params.accountId}` : '/transactions/recurringPayments', reqHeader)
        .then(res => {
            var payments = res.data;
            if(typeof payments != 'string'){
                // for(let payment of payments){
                //     axios.get(`/accounts/singleAccount/${payment.payerAccount}`, reqHeader)
                //     .then(res => payment.payerAccount = res.data.account)
                //     .catch(err => console.log(err));
        
                //     axios.get(`/accounts/singleAccount/${payment.payeeAccount}`, reqHeader)
                //     .then(res => payment.payeeAccount = res.data.account)
                //     .catch(err => console.log(err));
                // }
                payments = payments.filter(payment => payment.activeStatus === 'active');
                console.log(payments)
                setRecurringList(payments.length > 0 ? payments : 'Could not find any recurring payments');
            }
        })
        .catch(err => {
            console.log(err); 
        });
    }, [params]);
    
    function deletePayment(id){
        axios.put(`/transactions/cancelRecurringPayment`, {recurringPaymentId: id}, reqHeader)
        .then(res => setFlashMessage(res.data))
    }

    return (
        <>
        <Card>
            <Card.Header>Header</Card.Header>
            <Card.Body>
                {flashMessage &&
                <Card.Text>{flashMessage}</Card.Text>}
            <Table>
                <thead>
                    <th>From Account</th>
                    <th>To Account #</th>
                    <th>Amount</th>
                    <th>Interval</th>
                    <th>Next Payment</th>
                </thead>
                <tbody>
            {typeof recurringList != 'string' ? recurringList.map(recurring => {
                return (
                <tr key={'recurring' + recurring.id}>
                    <td>{recurring.payerAccount} - {getSymbol(recurring.currency)}{recurring.currency} {recurring.accountType}</td>
                    <td>{recurring.payeeAccount}</td>
                    <td>{getSymbol(recurring.currency)}{recurring.originValue}</td>
                    <td>{displayDays(recurring.interval)}</td>
                    <td>{parseDate(recurring.paymentDate)}</td>
                    <td><Button variant='danger' onClick={() => setShowDelete(recurring.id)}>Cancel</Button></td>
                </tr>
                )
            }): <tr><td>{recurringList}</td></tr>}
                </tbody>
            </Table>
            </Card.Body>
        </Card>

        <Modal
            id = {'deletePayment' + showDelete}
            size = 'sm'
            show = { showDelete !== false }
            onHide = {() => setShowDelete(false)}
            className = 'text-center'
            centered
        >
            <Modal.Header closeButton closeVariant='white' className='bg-secondary text-light'/>
            <Modal.Body>
                <Row className='mb-3'>
                    Are you sure you want to delete this recurring payment?
                </Row>
                <Button variant='danger' onClick={() => deletePayment(showDelete)}>Yes, delete it</Button>
            </Modal.Body>
        </Modal>
        </>
    )
}


export default RecurringPayment
