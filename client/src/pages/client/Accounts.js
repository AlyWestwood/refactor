/**
 * View account info for client
 */

import React, {useEffect, useState} from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Card, Col, ListGroup, Nav } from 'react-bootstrap';
import axios from 'axios';
import { reqHeader } from '../../misc/reqHeader';
import DisplayAccounts from '../../components/DisplayAccounts';
import InactiveAccount from '../../components/InactiveAccount';

function Accounts() {
    const [accountList, setAccountList] = useState([]);
    const [totals, setTotals] = useState(null);
    const location = useLocation();

    useEffect(() => {
        axios.get('/accounts/getAccounts', reqHeader)
        .then(res => setAccountList(res.data.listOfAccounts))
        .catch(err => alert('Accounts error: ' + err.response.data.error));
    }, []);
    
    useEffect(() => {
        axios.get('/accounts/totals', reqHeader)
        .then(res => {
            console.log(res.data)
            setTotals(res.data)})
        .catch(err => console.log(err.response));
    }, [])

    console.log(location.pathname)
    if(location.pathname !== '/client/accounts'){
        return (
            <>
            <Nav variant='tabs' className='justify-content-end text-start' >
                <Nav.Item>
                    <Nav.Link href='/client/accounts'>Back to Accounts</Nav.Link>
                </Nav.Item>
            </Nav>
            <Outlet/>
            </>
            )
    }

    return (
        <>
        <Nav variant='tabs' className='justify-content-end text-start' >
            <Nav.Item>
                <Nav.Link href='/client/accounts/openAccount'>New Account</Nav.Link>
            </Nav.Item>
        </Nav>
        <h1 className='text-start'>Accounts Overview</h1>
        <Col lg={9}>
            {accountList && accountList.map(account => {
                if(account.activeStatus === 'inactive'){
                    return <InactiveAccount key={'account' + account.id} account ={account} />
                }
                if(account.activeStatus === 'active'){
                    return <DisplayAccounts key={"account" + account.id} account = {account} />
                }
                return <></>
            })}
  
        </Col>
        <Col>
            <Card className='m-3 sticky-top text-end'>
                <Card.Header className='h5'>
                    Totals
                </Card.Header>
                <Card.Body>
                    <Card.Title>
                        Grand total assets<br/>
                        CAD ${totals ? totals.totalBalanceInCad.toFixed(2) : '...'}
                    </Card.Title>
                </Card.Body>
                <ListGroup>
                    <ListGroup.Item>Total CAD ${totals ? totals.totalForeign.totalCAD.toFixed(2) : '...'}</ListGroup.Item>
                    <ListGroup.Item>Total USD ${totals ? totals.totalForeign.totalUSD.toFixed(2) : '...'}</ListGroup.Item>
                    <ListGroup.Item>Total EUR €{totals ? totals.totalForeign.totalEUR.toFixed(2) : '...'}</ListGroup.Item>
                    <ListGroup.Item>Total GBP £{totals ? totals.totalForeign.totalGBP.toFixed(2) : '...'}</ListGroup.Item>
                </ListGroup>
            </Card>
        </Col>
        </>
    )
}

export default Accounts
