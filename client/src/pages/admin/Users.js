import React, { useEffect, useState } from "react";
import axios from "axios";
import { reqHeader } from "../../misc/reqHeader";
import { Card, ListGroup, Row, Col, Modal, Button, Alert } from "react-bootstrap";
import { parseDateTime } from "../../misc/accountUtils";

function Users() {
  const [userList, setUserList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState("");

  // const [inactiveUsers, setInactiveUsers] = useState([]);
  const [sort, setSort] = useState("role");

  useEffect(() => {
      console.log("in use effect");
    axios
      .get("/admins/allUsers?sort=" + sort, reqHeader)
      .then((res) => {
        setUserList(res.data.listOfUsers)
        console.log(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  // useEffect(() => {
  //     axios.get('/admins/approveUsers', reqHeader)
  //     .then(res => {
  //         setInactiveUsers(res.data.listOfUsers)
  //     })
  //     .catch(err => console.log(err));
  // }, []);

  function activateUser(user) {
    axios
      .put("/admins/enableUser", { userId: user.id }, reqHeader)
      .then((res) => {
        var newList = userList;
        newList[newList.indexOf(user)].activeStatus = "active";
        setUserList(newList);
        setShowModal(false);
        setSuccess('User account successfully activated')
      })
      .catch((err) => {
        console.log(err);
        setAlert("There was a problem with your request")
      });
  }

  function disableUser(user) {
    axios
      .post("/admins/disableUser", { userId: user.id }, reqHeader)
      .then((res) => {
        var newList = userList;
        newList[newList.indexOf(user)].activeStatus = "disabled";
        setUserList(newList);
        setShowModal(false);
        setSuccess("User account disabled")
      })
      .catch((err) => {
        console.log(err);
        setAlert("There was a problem with your request");
      });
  }

  return (
    <>
      <Row>
        <Col>
          <h1>Approve Users</h1>
        </Col>
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

        <Col className="col-4">
            <label>Sort By</label>
          <select className="form-select" onChange={(e) => {
                setSort(e.target.value)
            }}>
            <option disabled >
              Sort By
            </option>
            <option value="role">User Role</option>
            <option value="activeStatus">User Acount Status</option>
            <option value="lastName">User Last Name</option>
          </select>
        </Col>
      </Row>

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
        {userList && userList.map((user) => {
            return (
              <ListGroup.Item
                key={"user" + user.id}
                action
                onClick={() => setShowModal(user.id)}
              >
                <Row>
                  <Col>{user.lastName}</Col>
                  <Col>{user.firstName}</Col>
                  <Col>{user.activeStatus}</Col>
                  <Col>{user.role}</Col>
                </Row>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card>
      {userList && userList.map((user) => {
        return (
          <Modal
            key={"userModal" + user.id}
            size="lg"
            show={showModal === user.id}
            onHide={() => setShowModal(false)}
            aria-labelledby={"user" + user.id}
            centered
          >
            <Modal.Header
              variant="white"
              closeButton
              closeVariant="white"
              className="bg-secondary text-light"
            >
              <Modal.Title id={"user" + user.id}>
                {user.lastName}, {user.firstName}
              </Modal.Title>
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
                <Col>{parseDateTime(user.createdAt)}</Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              {user.activeStatus !== "active" && (
                <Button onClick={() => activateUser(user)}>
                  Activate User
                </Button>
              )}
              {user.activeStatus !== "disabled" && (
                <Button onClick={() => disableUser(user)} variant="danger">
                  Disable
                </Button>
              )}
            </Modal.Footer>
          </Modal>
        );
      })}
      <Modal></Modal>
    </>
  );
}

export default Users;
