/**
 * View account info for client
 */

import React from 'react';
import {Link} from 'react-router-dom';
import { Card, Col, ListGroup } from 'react-bootstrap'

function Account() {
    return (
        <>
        <h1 className='text-start'>Accounts Overview</h1>
        <Col md={9}>
        <Card className='m-3'>
                <Card.Header>account number</Card.Header>
                <ListGroup>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                </ListGroup>
            </Card>
            <Card className='m-3'>
                <Card.Header>account number</Card.Header>
                <ListGroup>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                </ListGroup>
            </Card>
            <Card className='m-3'>
                <Card.Header>account number</Card.Header>
                <ListGroup>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                </ListGroup>
            </Card>
            <Card className='m-3'>
                <Card.Header>account number</Card.Header>
                <ListGroup>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                    <ListGroup.Item>money</ListGroup.Item>
                </ListGroup>
            </Card>
        </Col>
        <Col>
            <Card className='m-3 sticky-top'>
                <Card.Header>
                    words
                </Card.Header>
                <Card.Body>
                    <Link to='/openAccount'>Open a new account</Link>
                    <Card.Text>
                        Grand total assets
                    </Card.Text>
                </Card.Body>
                <ListGroup>
                    <ListGroup.Item>Total saving</ListGroup.Item>
                    <ListGroup.Item>Total spending</ListGroup.Item>
                    <ListGroup.Item>Total credit</ListGroup.Item>
                </ListGroup>
            </Card>
        </Col>
        </>
    )
}

export default Account
