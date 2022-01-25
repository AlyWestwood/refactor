import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { Card, Button, Row, Col } from "react-bootstrap";
import { reqHeader } from "../../misc/reqHeader";
import { Formik, Field, ErrorMessage, Form } from "formik";
import * as Yup from "yup";

function NewTransfer() {

  const style = {
    position: "absolute",
    top: "50%",
    left: "43%",
    height: "100px",
    "marginTop": "-50px",
  }

  const [accountList, setAccountList] = useState([]);
  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const params = useParams();
  
  useEffect(() => {
    axios
      .get("/accounts/totals", reqHeader)
      .then((result) => {
        if(!params.accountId){
          setAccountList(result.data.accountTotals);
          initialValues.payerAccountId = result.data.accountTotals[0].accountId;
        } else {
          setAccountList(result.data.accountTotals.filter(account => parseInt(account.accountId) === parseInt(params.accountId)))
        }
        })
      .catch((err) => console.log(err.response.data));
  }, [params]);

  const initialValues = {
    payerAccountId: params.accountId ? params.accountId : "",
    payeeAccountId: "",
    originValue: "",
  };



  const onSubmit = async (data, { resetForm }) => {
    setAlert("");
    setSuccess("");
    setLoading(true);
    console.log(data);
    axios
      .post("/transactions/transferFunds", data, reqHeader)
      .then((response) => {
        console.log(response);
        setSuccess("Transfered Successfully");
        resetForm();
        setLoading(false);
      })
      .catch((error) => {
        console.log(error.response.data);
        setAlert(error.response.data);
        setLoading(false);
      });
  };

  const validationSchema = Yup.object().shape({
    payerAccountId: Yup.number().required(
      "The account the payment will be withdrawn from is required."
    ),
    payeeAccountId: Yup.string().required(
      "The account that will receive the deposit is required."
    ),
    originValue: Yup.number().min(1, "The minimum payment amount is $1").required("The payment value is required."),
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
            {loading && (
        <img
          src={require("../../resources/loading.gif")}
          alt="loading..."
         style={style}
        />
      )}
      <Card.Body>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          <Form>
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
            <Row className='mb-3'>
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
