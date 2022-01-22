import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { reqHeader } from '../../misc/reqHeader';
import { Card, ListGroup, Row, Col, Modal, Button } from 'react-bootstrap';
import { parseDate } from '../../misc/accountUtils';
import { Navigate, useNavigate } from 'react-router-dom';


function Users() {

    const [userList, setUserList] = useState([]);
    const [showModal, setShowModal] = useState(false)
    const [inactiveUsers, setInactiveUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {

        axios.get('/admin/allUsers', reqHeader)
        .then(res => setUserList(res.data.listOfUsers))
        .catch(err => console.log(err));


    }, []);

    useEffect(() => {
        axios.get('/admin/approveUsers', reqHeader)
        .then(res => {
            setInactiveUsers(res.data.listOfUsers)
        })
        .catch(err => console.log(err));
    }, []);
    
    function activateUser(user){
        axios.put('/admin/enableUser', {userId: user.id}, reqHeader)
        .then(res => {
            var newList = userList;
            newList[newList.indexOf(user)].activeStatus = 'active';
            setUserList(newList);
            setShowModal(false);
        })
        .catch(err => console.log(err))
    }

    function disableUser(user){
        axios.post('/admin/disableUser', {userId: user.id}, reqHeader)
        .then(res => {
            var newList = userList;
            newList[newList.indexOf(user)].activeStatus = 'disabled';
            setUserList(newList);
            setShowModal(false);
        })
        .catch(err => console.log(err))
    }

  return (
    <>
    <h1>Users</h1>
    <Card>
        <Card.Header>                
            <Row>
                <Col>Last Name</Col>
                <Col>First Name</Col>
                <Col>Status</Col>
                <Col>Role</Col>
            </Row>
        </Card.Header>
        <ListGroup>
            {userList.map(user => {
                return(
                    <ListGroup.Item key={'user' + user.id} onClick={() => setShowModal(user.id)}>
                        <Row>
                            <Col>{user.lastName}</Col>
                            <Col>{user.firstName}</Col>
                            <Col>{user.activeStatus}</Col>
                            <Col>{user.role}</Col>
                        </Row>
                    </ListGroup.Item>
                )
            })}
        </ListGroup>
    </Card>
    {userList.map(user => {
        return(
            <Modal
                key={'userModal' + user.id}
                size="lg"
                show={showModal === user.id}
                onHide={() => setShowModal(false)}
                aria-labelledby={'user' + user.id}
                centered
                
            >
                <Modal.Header variant='white' closeButton closeVariant='white' className='bg-secondary text-light'>
                    <Modal.Title id={'user' + user.id}>{user.lastName}, {user.firstName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col>Status</Col>
                        <Col>{user.activeStatus}</Col>
                    </Row>
                    <Row>
                        <Col>Role</Col>
                        <Col>{user.role}</Col>
                    </Row>
                    <Row>
                        <Col>Email</Col>
                        <Col>{user.email}</Col>
                    </Row>
                    <Row>
                        <Col>Phone</Col>
                        <Col>{user.phone}</Col>
                    </Row>
                    <Row>
                        <Col>Birthdate</Col>
                        <Col>{user.birthdate}</Col>
                    </Row>
                    <Row>
                        <Col>Registration date</Col>
                        <Col>{parseDate(user.createdAt)}</Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                        {user.activeStatus !== 'active' && <Button onClick={() => activateUser(user)}>Activate User</Button>}
                        {user.activeStatus !== 'disabled' && <Button onClick={() => disableUser(user)} variant='danger'>Disable</Button>}
                </Modal.Footer>
            </Modal>
        )
    })}
    <Modal></Modal>
    </>
  );
  
}

export default Users;
