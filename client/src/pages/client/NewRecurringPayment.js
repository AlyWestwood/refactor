import React, { useState,  useEffect } from "react";
import axios from "axios";
import { Card, Button, Row, Col } from "react-bootstrap";
// import { reqHeader } from "../../misc/reqHeader";
import { Formik, Field, ErrorMessage, Form } from "formik";
import * as Yup from "yup";

function NewRecurringPayment() {
  const [accountList, setAccountList] = useState([]);
  useEffect(() => {
    axios
      .get("/accounts/totals", {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((result) => {
        setAccountList(result.data.accountTotals);
        // initialValues.payerAccountId = result.data.accountTotals[0].accountId;
      })
      .catch((err) => console.log(err.response.data));
  }, []);

  const initialValues = {
    payerAccountId: "",
    payeeAccountId: "",
    interval: "",
    originValue: "",
    startDate: "",
  };

  const onSubmit = (data, {resetForm}) => {
    window.alert("here");
    axios
      .post("/transactions/recurringPayments", data, {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        console.log(response);
        resetForm();
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  const validationSchema = Yup.object().shape({
    payerAccountId: Yup.number().required(
      "The account the payment will be withdrawn from is required."
    ),
    interval: Yup.number().required("Must have interval"),
    payeeAccountId: Yup.string().required(
      "The account that will receive the deposit is required."
    ),
    originValue: Yup.number().required("The payment value is required."),
    startDate: Yup.date().required(
      "The date of the first payment is required."
    ),
  });

  return (
    <Card className="col-7">
      <Card.Header>Set up a recurring payment</Card.Header>
      <Card.Body>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          // validator={() => ({})}
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
              <Col>
                <div className="form-group">
                  <label className="form-label">Value</label>
                  <Field
                    className="form-control"
                    type="number"
                    name="originValue"
                    placeholder="Amount to be withdrawn in the currency of the original account"
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
              <Col>
                <div className="form-group">
                  <label className="form-label">Repeating Interval</label>
                  <Field
                    className="form-control"
                    type="number"
                    name="interval"
                    placeholder="Number of days between payments"
                    min="1"
                  />
                </div>
                <ErrorMessage
                  className="text-danger"
                  name="interval"
                  component="span"
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <div className="form-group">
                  <label className="form-label">Payment start date</label>
                  <Field
                    className="form-control"
                    type="date"
                    name="startDate"
                  />
                </div>
                <ErrorMessage
                  className="text-danger"
                  name="startDate"
                  component="span"
                />
              </Col>
            </Row>
            <Button type="submit">Create recurring payment</Button>
          </Form>
        </Formik>
      </Card.Body>
    </Card>
  );
}

export default NewRecurringPayment;
