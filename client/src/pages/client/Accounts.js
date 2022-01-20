/**
 * View account info for client
 */

import React, {useEffect, useState} from 'react';
import {Link, useNavigate, useParams, Outlet } from 'react-router-dom';
import { Card, Col, Row, ListGroup } from 'react-bootstrap'
import axios from 'axios';
import { reqHeader } from '../../misc/reqHeader';
import DisplayAccount from '../../components/DisplayAccount';

function Accounts() {
    const [accountList, setAccountList] = useState([]);
    const [totalDebit, setTotalDebit] = useState();
    const [totalCredit, setTotalCredit] = useState(0);
    const params = useParams();

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
        });

    }, [])

    if(params.accountId){
        return <Outlet/>
    }

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

export default Accounts
