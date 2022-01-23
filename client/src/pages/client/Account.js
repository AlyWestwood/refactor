import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { reqHeader } from "../../misc/reqHeader";
import DisplayAccount from "../../components/DisplayAccount";
import { Col, Card, ListGroup, Button, Row } from "react-bootstrap";

function Account() {
  const params = useParams();
  const [account, setAccount] = useState({});
  const [closeAcct, setClose] = useState(false);
  const [alert, setAlert] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    axios
      .get(`/accounts/singleAccount/${params.accountId}`, reqHeader)
      .then((res) =>{setAccount(res.data.account); console.log(account);} )
      .catch((err) => alert(err.response.data.error));
  }, [params.accountId]);

  useEffect(() => {
    setSuccess("");
    setAlert("");
    if (closeAcct === true) {
      const body = {
        accountId: params.accountId,
      };
      axios
        .put("/accounts/closeAccount", body, reqHeader)
        .then((result) => {
          setSuccess(result.data);
        })
        .catch((error) => {
          console.log(error.response.data);
          setAlert(error.response.data);
        });
    }
  }, [closeAcct]);

  if (account.activeStatus !== "active") {
    return account.activeStatus === "inactive" ? (
      <div>This account has not yet been approved</div>
    ) : (
      <div>This account does not exist</div>
    );
  }

  return (
    <>
      <Col md={9}>
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
        <DisplayAccount key={account.id} account={account} />
      </Col>
      <Col>
        <Row>
          <Col>
            <Card className="m-3 sticky-top text-end">
              <Card.Header className="h5">Tools</Card.Header>
              {/* <Card.Body>
                    <Card.Text>
                        Grand total assets
                    </Card.Text>
                </Card.Body> */}
              <ListGroup>
                <ListGroup.Item>
                  <Link to={`/client/transfer/${account.id}`}>
                    Transfer Funds
                  </Link>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Link to={`/client/chequedeposit/${account.id}`}>
                    Deposit a cheque
                  </Link>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Link to={`/client/newrecurringpayment/${account.id}`}>
                    Set up a recurring payment
                  </Link>
                </ListGroup.Item>
                <ListGroup.Item>
                  {account.balance === "0.00" ? (
                    <Button
                      type="button"
                      onClick={() => {
                        setClose(true);
                      }}
                    >
                      Close Account
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => {setAlert("Accounts can only be closed if the balance is $0.00")}} className="btn-secondary">
                      Close Account
                    </Button>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>

{account.accountType === "credit" && 
        <Row>
          <Col>
            <Card className="m-3 sticky-top text-end">
              <Card.Header className="h5">Credit Account Information</Card.Header>
              <ListGroup>
                  <ListGroup.Item>
                      Credit Limit: <br /> ${account.creditLimit}
                  </ListGroup.Item>

                <ListGroup.Item>
                Next Payment Due Date: < br/>{account.nextPaymentDueDate}
                </ListGroup.Item>
                <ListGroup.Item>
                  Minimum Payment Due Now: <br />${account.minimumPayment}
                </ListGroup.Item>
                <ListGroup.Item>
                  Interest Rate: <br />{account.interestRate}% APR
                </ListGroup.Item>
                <ListGroup.Item>
                  Late Payment Fees Due: <br />${account.latePaymentFees}<br />
                  <Link to={`/client/payfees/${account.id}`}>
                    Pay Late Payment Fees
                  </Link>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
        }
      </Col>
    </>
  );
}

export default Account;
