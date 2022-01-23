import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { reqHeader } from '../../misc/reqHeader';
import DisplayAccount from '../../components/DisplayAccount';
import { Col, Card, ListGroup } from 'react-bootstrap';

function Account() {
    const params = useParams();
    const [account, setAccount] = useState({});


    useEffect(() => {
        axios.get(`/accounts/singleAccount/${params.accountId}`, reqHeader)
        .then(res => setAccount(res.data.account))
        .catch(err => alert(err.response.data.error))
    }, [params.accountId]);

    if(account.activeStatus !== 'active'){
        return (
            account.activeStatus === 'inactive' ? <div>This account has not yet been approved</div> : <div>This account does not exist</div>
        )
    }

    return (
        <>
        <Col md={9}>
            <DisplayAccount key={account.id} account={account}/>
        </Col>
        <Col>
            <Card className='m-3 sticky-top text-end'>
                <Card.Header className='h5'>
                    Tools
                </Card.Header>
                {/* <Card.Body>
                    <Card.Text>
                        Grand total assets
                    </Card.Text>
                </Card.Body> */}
                <ListGroup>
                    <ListGroup.Item>
                        <Link to={`/client/transfer/${account.id}`}>Transfer Funds</Link>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Link to={`/client/chequedeposit/${account.id}`}>Deposit a cheque</Link>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Link to={`/client/newrecurringpayment/${account.id}`}>Set up a recurring payment</Link>
                    </ListGroup.Item>
                </ListGroup>
            </Card>        
        </Col>
        </>
    )
}

export default Account
