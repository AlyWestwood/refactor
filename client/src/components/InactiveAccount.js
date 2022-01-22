import React from 'react';
import { Card, Row, Col } from 'react-bootstrap' 

function InactiveAccount({account}) {
    return (
        <Card className='m-3 opacity-50' > 
            <Card.Header className='text-start h5'>
                <Row>
                    <Col className=''>
                        {account.accountType === 'debit' ? 'Debit' : 'Credit'} - {account.currency}
                    </Col>
                    <Col className='text-end'>
                        Account #: {account.id}
                    </Col>
                </Row>
            </Card.Header>
            <Card.Body>
                <Card.Title className='text-center'>Pending Approval</Card.Title>
            </Card.Body>
        </Card>

    )
}
export default InactiveAccount;
