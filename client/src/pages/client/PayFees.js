import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { Card, Button, Row, Col } from "react-bootstrap";
import { reqHeader } from "../../misc/reqHeader";
import { Formik, Field, ErrorMessage, Form } from "formik";
import * as Yup from "yup";

function PayFees() {
  const [accountList, setAccountList] = useState([]);
  const [feesAccounts, setFeesAccounts] = useState([]);
  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState("");
  const [fees, setFees] = useState("0.00");
  const [feesMap, setFeesMap] = useState([]);
  const params = useParams();

  useEffect(() => {
    axios
      .get("/accounts/totals", reqHeader)
      .then((result) => {
        setAccountList(result.data.accountTotals);
        initialValues.payerAccountId = result.data.accountTotals[0].accountId;
      })
      .catch((err) => console.log(err.response.data));

    axios
      .get("/accounts/withFees", reqHeader)
      .then((result) => {
        console.log(result.data);
        if(!params.accountId){
          setFeesAccounts(result.data);
        initialValues.accountWithFees = result.data[0].id;
        setFees(result.data[0].latePaymentFees);
        console.log(initialValues.accountWithFees);
        let feesArray = [];
        for (let i = 0; i < result.data.length; i++) {
          feesArray[result.data[i].id] = result.data[i].latePaymentFees;
        }
        setFeesMap(feesArray);
        console.log(feesArray)
        }else{
          const accountsArray = result.data.filter(account => parseInt(account.id) === parseInt(params.accountId));
          console.log(accountsArray);
          setFees(accountsArray[0].latePaymentFees);
          setFeesAccounts(accountsArray);
          initialValues.accountWithFees = accountsArray[0].id;
        }
      })
      .catch((error) => {
        console.log("error!!!!");
        console.log(error);
      });
  }, [success]);

  let initialValues = {
    payerAccountId: "",
    accountWithFees: "",
    originValue: "",
    payingFees: true,
  };

  const onSubmit = (data, { resetForm }) => {
    setAlert("");
    setSuccess("");
    console.log(data);
    axios
      .post("/transactions/transferFunds", data, reqHeader)
      .then((response) => {
        console.log(response);
        setSuccess(response.data);
        setFees("--");
        resetForm();
      })
      .catch((error) => {
        console.log(error.response.data);
        setAlert(error.response.data);
      });
  };

  const validationSchema = Yup.object().shape({
    payerAccountId: Yup.number().required(
      "The account the payment will be withdrawn from is required."
    ),
    accountWithFees: Yup.number().required(
      "The account that with fees owing is required."
    ),
    originValue: Yup.number().required("The payment value is required."),
  });

  // if(!feesAccounts || feesAccounts.length === 0){
  //   return (
  //   <>
  //     <h2>Congratulations! You have no fees to pay</h2>
  //     {params.accountId ? <a href={`/client/accounts/${params.accountId}`}>Back to Account</a>
  //       : <a thref='/client/accounts'>Back to Accounts</a>}
  //   </>)
  // }

  return (
    <Card className="col-7">
      <Card.Header>Pay Late Payment Fees</Card.Header>
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
      <Card.Body>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          <Form
            onChange={(nextValues) => {
              if (nextValues.target.name === "accountWithFees") {
                setFees(feesMap[nextValues.target.value]);
              }
            }}
          >
            <Row className='mb-3'>
              <Col>
                <div className="form-group">
                  <label className="form-label">From Account</label>
                  <Field
                    as="select"
                    className="form-select"
                    name="payerAccountId"
                  >
                    {accountList && accountList.map((account) => {
                      return (
                        <option
                          key={account.accountId}
                          value={account.accountId}
                        >
                          Account #{account.accountId} - {account.currency}{" "}
                          {account.accountType}
                        </option>
                      );
                    })}
                  </Field>
                </div>
                <ErrorMessage
                  className="text-danger"
                  name="payerAccountId"
                  component="span"
                />
              </Col>
              <Col>
                <div className="form-group">
                  <label className="form-label">Account with fees to pay</label>
                  <Field
                    as="select"
                    className="form-select"
                    name="accountWithFees"
                  >
                    {feesAccounts && feesAccounts.map((feesAccount) => {
                      return (
                        <option
                          key={feesAccount.accountId}
                          value={feesAccount.id}
                        >
                          Account #{feesAccount.id} - {feesAccount.currency}{" "}
                          {feesAccount.accountType}
                        </option>
                      );
                    })}
                    
                  </Field>
                </div>
                <ErrorMessage
                  className="text-danger"
                  name="accountWithFees"
                  component="span"
                />
              </Col>
            </Row>
            <Row className='mb-3'>
              <Col>
                <div className="form-group">
                  <label className="form-label">Late Payment Fees</label>
                </div>
                <div className="form-control " disabled>
                  ${fees}
                </div>
              </Col>
              <Col>
              <label className="form-label">Payment</label>
                <div className="input-group">
                  
                  <span className="input-group-text" id="basic-addon1">$</span>
                  <Field
                    className="form-control"
                    type="number"
                    name="originValue"
                    placeholder="Amount to pay"
                    min="1"
                    step=".01"
                  />
                </div>
                <ErrorMessage
                  className="text-danger"
                  name="originValue"
                  component="span"
                />
              </Col>
            </Row>
            <Button type="submit">Make Transfer</Button>
          </Form>
        </Formik>
      </Card.Body>
    </Card>
  );
}

export default PayFees;