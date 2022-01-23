import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Card, Table, Modal, Row, Col, Form, Button, Accordion, Alert } from 'react-bootstrap';
import { reqHeader } from '../../misc/reqHeader';
import DisplayAccounts from '../../components/DisplayAccounts';
import { getSymbol, parseDateTime } from '../../misc/accountUtils';



function Accounts() {

  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [userTotals, setUserTotals] = useState({});
  const [formAccount, setFormAccount] = useState({});
  const [form, setForm] = useState({creditLimit: 1000, interestRate: 0.19, accountId: 0, activeStatus: ''});
  const [success, setSuccess] = useState("");
  const [alert, setAlert] = useState("");

  useEffect(() => {
    axios.get('/admin/approveCreditAccounts', reqHeader)
    .then(res => {
      setAccounts(res.data.listOfInactiveCreditAccounts);
    })
    .catch(err => console.log(err))
  }, [])

  function closeForm(){
    setShowForm(false);
    setFormAccount({});
    setUserTotals({});
  }

  function getApprovalForm(account){
    axios.get(`/admin/totals/${account.userId}`, reqHeader)
    .then(res => {
      console.log(res.data)
      setFormAccount(account);
      setUserTotals(res.data);
      setShowForm(true);
      setForm({...form, accountId: account.id});
    })
  }
  
  function processAccount(status){
    form.status = status;
    console.log(form);
    axios.put('/admin/approveCreditAccounts', form, reqHeader)
    .then(res => {
      setSuccess(res.data.message)
      setAccounts(accounts.filter(account => account.id !== formAccount.id));
      closeForm();
    })
    .catch(err => {
      console.log(err);
      setAlert('There was an error processing your request');
    })
  }

  return (
      <>
        <h1>Awaiting Approval</h1>
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

        <Card>
          <Card.Header>
            &nbsp;
          </Card.Header>
          <Card.Body>
            <Table>
              <thead>
                <th>Client ID #</th>
                <th>Date of application</th>
                <th>Currency</th>
              </thead>
              <tbody>
          {accounts.map(account => {
            return(
                <tr onClick={() => getApprovalForm(account)} key={'application' + account.id}>
                  <td>{account.userId}</td>
                  <td>{parseDateTime(account.createdAt)}</td>
                  <td>{account.currency}</td>
                </tr>
              )
            })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <Modal
          size = 'lg'
          show = { showForm }
          onHide = {() => closeForm()}
          centered  
        >
            <Modal.Header closeButton closeVariant='white' className='bg-secondary text-light'>
              Account # {formAccount.id} - application by client # {formAccount.userId}
            </Modal.Header>
            <Modal.Body>
              <Row className='mb-3'>
                <Col>Client's total Assets: ${userTotals.totalBalanceInCad} CAD</Col>
              </Row>
              <Row className='mb-3'>
                <Accordion>
                  <Accordion.Item eventKey='0'>
                    <Accordion.Header>Accounts Dossier</Accordion.Header>
                    <Accordion.Body>
                      <Table>
                        <thead>
                          <th>Account</th>
                          <th>Balance</th>
                        </thead>
                        <tbody>
                        { userTotals.accountTotals && userTotals.accountTotals.map(account => {
                          return (
                            <tr key={'account' + account.id}>
                              <td>{account.currency} - {account.accountType}</td>
                              <td>{getSymbol(account.currency)}{account.availableBalance}</td>
                              
                            </tr>
                          )
                        })}
                        </tbody>
                      </Table>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Row>
              <Form>
                <Row className='mb-3'>
                  <Col>
                    <Form.Label>Credit Limit {getSymbol(formAccount.currency)} {formAccount.currency}</Form.Label>
                      <Form.Control type='number' defaultValue='1000' onChange={e => setForm({...form, creditLimit : e.target.value})}/>
                  </Col>     
                  <Col>
                  <Form.Label>Interest Rate %</Form.Label>
                    <Form.Control type='number' defaultValue='0.19' step={0.01} onChange={e => setForm({...form, interestRate : e.target.value})}/>
                  </Col>
                </Row>
                <Row className='mb-3 text-center'>
                  <Col>
                    <Button className='m-2' onClick={e => {
                      processAccount('active');
                      closeForm();
                      }}>Approve</Button>
                    <Button variant='danger' className='m-2' onClick={e =>{
                      processAccount('disabled');
                      closeForm();
                    }}>Reject</Button>
                  </Col>
                </Row>
              </Form>
            </Modal.Body>
        </Modal>
      </>
    );
}

export default Accounts;
