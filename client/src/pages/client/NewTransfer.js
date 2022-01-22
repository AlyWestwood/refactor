import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Button, Row, Col } from "react-bootstrap";
import { reqHeader } from "../../misc/reqHeader";
import { Formik, Field, ErrorMessage, Form } from "formik";
import * as Yup from "yup";

function NewTransfer() {
  const [accountList, setAccountList] = useState([]);
  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    axios
      .get("/accounts/totals", reqHeader)
      .then((result) => {
        setAccountList(result.data.accountTotals);
        initialValues.payerAccountId = result.data.accountTotals[0].accountId;
      })
      .catch((err) => console.log(err.response.data));
  }, []);

  const initialValues = {
    payerAccountId: "",
    payeeAccountId: "",
    originValue: "",
  };

  const onSubmit = (data, { resetForm }) => {
    setAlert("");
    setSuccess("");
    console.log(data);
    axios
      .post("/transactions/transferFunds", data, reqHeader)
      .then((response) => {
        console.log(response);
        setSuccess("Transfered Successfully");
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
    payeeAccountId: Yup.string().required(
      "The account that will receive the deposit is required."
    ),
    originValue: Yup.number().required("The payment value is required."),
  });

  return (
    <Card className="col-7">
      <Card.Header>Transfer Funds</Card.Header>
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
          <Form>
            <Row>
              <Col>
                <div className="form-group">
                  <label className="form-label">From Account</label>
                  <Field
                    as="select"
                    className="form-select"
                    name="payerAccountId"
                  >
                    {accountList.map((account) => {
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
                  <label className="form-label">Pay To</label>
                  <Field
                    className="form-control"
                    type="number"
                    name="payeeAccountId"
                    placeholder="Account Number"
                    min="1"
                  />
                </div>
                <ErrorMessage
                  className="text-danger"
                  name="payeeAccountId"
                  component="span"
                />
              </Col>
            </Row>
            <Row>
              <Col xs={6}>
                <div className="form-group">
                  <label className="form-label">Value</label>
                  <Field
                    className="form-control"
                    type="number"
                    name="originValue"
                    placeholder="Amount to be withdrawn"
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

export default NewTransfer;
