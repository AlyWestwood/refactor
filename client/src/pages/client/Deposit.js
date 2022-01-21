/**
 * Make cheque deposits
 */

import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../misc/AuthContext";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { reqHeader } from "../../misc/reqHeader";

function Deposit() {

  // const tempData = {
  //   payeeAccountId: 3,
  //   payerAccountId: 2,
  //   value: 10,
  //   chequeNumber: 265,
  // };
  // const { payeeAccountId, payerAccountId, value, chequeNumber } = tempData;


//   const [file, setFile] = useState(null);
  const [accountList, setAccountList] = useState([]);

  useEffect(() => {
    axios.get('/accounts/totals', reqHeader)
    .then(res => setAccountList(res.data.accountTotals))
    .catch(err => console.log(err.response.data));
  }, []);

  const submitFile = submit => {
      submit.preventDefault();

      try {
        if (!submit.target.files) {
          throw new Error("Select a file first!");
        }
        } catch (error) {
        // handle error
        console.log(error.data)
        }
        const formData = new FormData();
        formData.append('file', submit.target.file.files[0]);

        // console.log(submit.target.file.files)
        // var form = {
        //     payeeAccountId: submit.target.payeeAccount.value,
        //     payerAccountId: submit.target.payerAccount.value,
        //     value: submit.target.value.value,
        //     chequeNumber: submit.target.chequeNumber.value,
        //     file: submit.target.file.files[0]
        // }
      formData.append('payeeAccountId', submit.target.payeeAccount.value);
      formData.append('payerAccountId', submit.target.payerAccount.value);
      formData.append('value', submit.target.value.value);
      formData.append('chequeNumber', submit.target.chequeNumber.value);

    //   formData.append("file", file[0]);
      axios.post(`/transactions/depositCheque`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          accessToken: localStorage.getItem("accessToken"),
        },
      }).then((result) => {
        console.log(result);
      }).catch((err) => {
        console.log(err.response.data)
      })
      // handle success
  };

  return (
    <Card className='col-7'>
        <Card.Header>Deposit a cheque</Card.Header>
        <Card.Body>
        <Form onSubmit={submitFile}>
        <Row>
        <Col>
        <Form.Group controlId='payeeAccount'>
            <Form.Label>Account</Form.Label>
            <Form.Select defaultValue='null' onChange={(event) => {}}>
                <option value='null' disabled>Select</option>
                {accountList.map(account => {
                    return <option key={account.accountId} value={account.accountId}>Account #{account.accountId} - {account.currency} {account.accountType}</option>
                })}
            </Form.Select>
        </Form.Group>
        </Col>
        <Col>
        <Form.Group controlId='payerAccount'>
            <Form.Label>Account number on Cheque</Form.Label>
            <Form.Control/>
        </Form.Group>
        </Col>
        </Row>
        <Row>
        <Col>
        <Form.Group controlId='value'>
            <Form.Label>Value</Form.Label>
            <Form.Control type='number' step={.01}/>
        </Form.Group>
        </Col>
        <Col>
        <Form.Group controlId='chequeNumber'>
            <Form.Label>Cheque S/N</Form.Label>
            <Form.Control />
        </Form.Group>
        </Col>
        </Row>
        <Row>
        <Form.Group controlId='file' className='mb-3'>
            <Form.Label>Upload image</Form.Label>
            <Form.Control type="file" />
        </Form.Group>
        </Row>
        <Button type='submit'>Send</Button>
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
