import axios from "axios";
import React, { useEffect, useState } from "react";
import { Form, Card, Row, Col, Button } from "react-bootstrap";
import { reqHeader } from "../../misc/reqHeader";

function Profile() {
  const [user, setUser] = useState({});
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordMatch, setNewPasswordMatch] = useState("");
  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    axios
      .get("/users/client", reqHeader)
      .then((response) => {
        console.log(response.data);
        response.data.sin = response.data.sin.slice(-4);
        setUser(response.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  }, [success]);

  const updatePassword = () => {
    setAlert("");
    setSuccess("");

    const body = {oldPassword: oldPassword, newPassword: newPassword}

    if(!oldPassword || !newPasswordMatch || ! newPassword){
        return setAlert("You haven't entered all the password fields.");
    }

    if (newPassword && newPasswordMatch !== newPassword) {
      return setAlert("Your new passwords do not match!");
    }

    if(newPassword.length < 4 || newPassword.length > 50){
        return setAlert("The password should be 4 to 50 characters.");
    }
    axios
      .put("/users/updatePassword", body, reqHeader)
      .then((response) => {
        setSuccess("Password update successful.");
      })
      .catch((error) => {
        setAlert("Your password could not be updated.");
      });
  };

  const updateUser = () => {
    setAlert("");
    setSuccess("");
    const user = { email: email, phone: phone};

    if(phone){
        if(!phone.match(/[0-9]{10}/)){
            return setAlert("Phone must be 10 digits!")
        }
    }

    if(!email && !phone){
        return setAlert("No data entered!");
    }

    axios.put("/users/updateUser", user, reqHeader).then((response) => {
        console.log(response);
        setSuccess("Contact information updated.");
    })
    .catch((error) => {
        setAlert(error.response.data);
      });
  }
  return (
    <div>
      <Card >
        {alert && (
          <div className="alert alert-danger" role="alert">
            {alert}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}
        <Card.Header>Your Information</Card.Header>
        <Card.Body>
          <Row className="justify-content-center text-center">
            <Col>
              <i>Name:</i> {user.firstName} {user.lastName}
            </Col>
            <Col>
              <i>Date of Birth:</i> {user.birthdate}
            </Col>
            <Col>
              <i>SIN:</i> *****{user.sin}
            </Col>
            <Col>
              <i>Email:</i> {user.email}
            </Col>
            <Col>
              <i>Phone Number:</i> {user.phone}
            </Col>
          </Row>
          <hr />
          <Row>
            <h5>Update Your Contact Information</h5>
            <Form className="mt-3">
              <Row>
                <Col className="col-6">
                  <Form.Group controlId="email">
                    <Form.Label>Update Email Address</Form.Label>

                    <Form.Control
                      type="email"
                      onChange={(event) => {
                        setEmail(event.target.value);
                      }}
                      placeholder={user.email}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="phone">
                    <Form.Label>Update Phone Number</Form.Label>

                    <Form.Control
                      type="text"
                      onChange={(event) => {
                        setPhone(event.target.value);
                      }}
                      placeholder={user.phone}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button type="button" className="mt-4" onClick={() => {updateUser()}}>Update Contact Info</Button>

              <hr/>
              <h5>Update Your Password</h5>
              <Row>
                <Col className="">
                  <Form.Group controlId="currentPw">
                    <Form.Label>Current Password</Form.Label>

                    <Form.Control
                      type="password"
                      onChange={(event) => {
                        setOldPassword(event.target.value);
                      }}
                      placeholder="****"
                    />
                  </Form.Group>
                </Col>
                <Col className="">
                  <Form.Group controlId="newPw">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      onChange={(event) => {
                        setNewPassword(event.target.value);
                      }}
                      placeholder="****"
                    />
                  </Form.Group>
                </Col>
                <Col className="">
                  <Form.Group controlId="newPwMatch">
                    <Form.Label>New Password Repeat</Form.Label>

                    <Form.Control
                      type="password"
                      onChange={(event) => {
                        setNewPasswordMatch(event.target.value);
                      }}
                      placeholder="****"
                    />
                  </Form.Group>
                </Col>
              </Row>
             
                  
              <Button type="button" className="mt-4" onClick={() => {updatePassword()}}>Update Password</Button>
              
              
            </Form>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Profile;
