/**
 * Make cheque deposits
 */

import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../misc/AuthContext";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { reqHeader } from "../../misc/reqHeader";
import loading from "../../resources/loading.gif";

function Deposit() {

  const style = {
    position: "absolute",
    top: "50%",
    left: "43%",
    height: "100px",
    "margin-top": "-50px",
  }
  // const tempData = {
  //   payeeAccountId: 3,
  //   payerAccountId: 2,
  //   value: 10,
  //   chequeNumber: 265,
  // };
  // const { payeeAccountId, payerAccountId, value, chequeNumber } = tempData;

  //   const [file, setFile] = useState(null);
  const [accountList, setAccountList] = useState([]);
  const [singleAccount, setSingleAccount] = useState({});
  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const params = useParams();

  useEffect(() => {
    if (!params.accountId) {
      axios
        .get("/accounts/totals", reqHeader)
        .then((res) => setAccountList(res.data.accountTotals))
        .catch((err) => console.log(err.response.data));
    } else {
      axios
        .get(`/accounts/singleAccount/${params.accountId}`, reqHeader)
        .then((res) => setSingleAccount(res.data.account))
        .catch((err) => console.log(err.response.data));
    }
  }, [params]);

  const submitFile = async (submit) => {
    setSuccess("");
    setAlert("");
    setLoading(true);
    submit.preventDefault();

    try {
      if (!submit.target.files) {
        throw new Error("Select a file first!");
      }
    } catch (error) {
      // handle error
      console.log(error.data);
    }
    const formData = new FormData();
    formData.append("file", submit.target.file.files[0]);

    // console.log(submit.target.file.files)
    // var form = {
    //     payeeAccountId: submit.target.payeeAccount.value,
    //     payerAccountId: submit.target.payerAccount.value,
    //     value: submit.target.value.value,
    //     chequeNumber: submit.target.chequeNumber.value,
    //     file: submit.target.file.files[0]
    // }
    formData.append("payeeAccountId", submit.target.payeeAccount.value);
    formData.append("payerAccountId", submit.target.payerAccount.value);
    formData.append("value", submit.target.value.value);
    formData.append("chequeNumber", submit.target.chequeNumber.value);

    //   formData.append("file", file[0]);
    await axios
      .post(`/transactions/depositCheque`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((result) => {
        console.log(result);
        setSuccess(result);
      })
      .catch((err) => {
        setAlert(err.response.data);
        console.log(err.response.data);
      });
    // handle success
    setLoading(false);
  };
  console.log(params.accountId);
  return (
    <Card className="col-7">
      <Card.Header>Deposit a cheque</Card.Header>
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
      {loading && (
        <img
          src={require("../../resources/loading.gif")}
          alt="loading..."
         style={style}
        />
      )}

      <Card.Body>
        <Form onSubmit={submitFile}>
          <Row>
            <Col>
              <Form.Group controlId="payeeAccount">
                <Form.Label>Account</Form.Label>
                <Form.Select
                  defaultValue={
                    params.accountId ? parseInt(params.accountId) : "null"
                  }
                >
                  {!params.accountId && (
                    <option value="null" disabled>
                      Select
                    </option>
                  )}
                  {params.accountId && (
                    <option value={params.accountId}>
                      Account #{params.accountId} - {singleAccount.currency}{" "}
                      {singleAccount.accountType}
                    </option>
                  )}
                  {accountList.map((account) => {
                    return (
                      <option key={account.accountId} value={account.accountId}>
                        Account #{account.accountId} - {account.currency}{" "}
                        {account.accountType}
                      </option>
                    );
                  })}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="payerAccount">
                <Form.Label>Account number on Cheque</Form.Label>
                <Form.Control />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId="value">
                <Form.Label>Value</Form.Label>
                <Form.Control type="number" step={0.01} />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="chequeNumber">
                <Form.Label>Cheque S/N</Form.Label>
                <Form.Control />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Form.Group controlId="file" className="mb-3">
              <Form.Label>Upload image</Form.Label>
              <Form.Control type="file" />
            </Form.Group>
          </Row>
          <Button type="submit">Send</Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Deposit;

// function Deposit() {
//     return (
//         <div>

//         </div>
//     )
// }

// export default Deposit
