import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, ListGroup, Row, Col, Modal, Button } from "react-bootstrap";
import { reqHeader } from "../../misc/reqHeader";

function ApproveCheques() {
  const [chequesList, setChequesList] = useState([]);
  const [showModal, setShowModal] = useState("");
  const [token] = useState(localStorage.getItem("accessToken"));
  const [approve, setApprove] = useState("");
  const [deny, setDeny] = useState("");
  const [success, setSuccess] = useState("");
  const [alert, setAlert] = useState("");
  const [paginate, setPaginate] = useState("");
  const [page, setPage] = useState(0);

  function RenderPages() {
    let pages = [];
    if (paginate.currentPage > 1) {
      pages.push(
        <li className="page-item">
          <a
            className="page-link"
            onClick={() => {
              setPage(paginate.currentPage - 1);
            }}
          >
            Previous
          </a>
        </li>
      );
    } else {
      pages.push(
        <li className="page-item disabled">
          <a
            className="page-link "
            onClick={() => {
              setPage(paginate.currentPage - 1);
            }}
          >
            Previous
          </a>
        </li>
      );
    }
    for (let i = 1; i < paginate.totalPages + 1; i++) {
      if (i === paginate.currentPage) {
        pages.push(
          <li className="page-item active">
            <a
              className="page-link"
              onClick={() => {
                setPage(i);
              }}
            >
              {i}
            </a>
          </li>
        );
      } else {
        pages.push(
          <li className="page-item">
            <a
              className="page-link"
              onClick={() => {
                setPage(i);
              }}
            >
              {i}
            </a>
          </li>
        );
      }
    }
    if (paginate.currentPage !== paginate.endPage) {
      pages.push(
        <li className="page-item">
          <a
            className="page-link"
            onClick={() => {
              setPage(Number(paginate.currentPage) + 1);
            }}
          >
            Next
          </a>
        </li>
      );
    } else {
      pages.push(
        <li className="page-item disabled">
          <a
            className="page-link "
            onClick={() => {
              setPage(Number(paginate.currentPage) + 1);
            }}
          >
            Next
          </a>
        </li>
      );
    }
    return <ul className="pagination m-3 justify-content-center">{pages}</ul>;
  }

  useEffect(() => {
    if (approve !== "") {
      const body = { status: "cleared", chequeId: approve };
      axios
        .put("/admin/approveCheque", body, reqHeader)
        .then((result) => {
          console.log(result);
          setSuccess(result.data);
          setTimeout(setSuccess(""), 10000);
        })
        .catch((error) => {
          setAlert(error.response.data);
          console.log(error.response.data);
          setTimeout(setAlert(""), 10000);
        });
      setApprove("");
    }

    if (deny !== "") {
      const body = { status: "denied", chequeId: deny };
      axios
        .put("/admin/approveCheque", body, reqHeader)
        .then((result) => {
          console.log(result);
          setSuccess(result.data);
          setTimeout(setSuccess(""), 10000);
        })
        .catch((error) => {
          setAlert(error.response.data);
          console.log(error.response.data);
          setTimeout(setAlert(""), 10000);
        });
      setDeny("");
    }

    axios
      .get("/admin/approveCheques?page=" + page, reqHeader)
      .then((result) => {
        console.log(result.data);
        setChequesList(result.data.pageOfCheques);
        setPaginate(result.data.pager);
        RenderPages();
      })
      .catch((err) => console.log(err));
  }, [approve, deny, page]);

  return (
    <div>
      <Card className="col-10">
        <Card.Header>Cheques requiring approval</Card.Header>
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
        <ListGroup>
          <ListGroup.Item>
            <Row>
              <Col>Cheque Number</Col>
              <Col>Upload Date</Col>
              <Col>Payer Account Id</Col>
              <Col>Payee Account Id</Col>
            </Row>
          </ListGroup.Item>
          {chequesList &&
            chequesList.map((cheque) => {
              return (
                <ListGroup.Item
                  key={cheque.chequeId}
                  onClick={() => {
                    setShowModal(cheque.chequeId);
                  }}
                >
                  <Row>
                    <Col>{cheque.chequeNumber}</Col>
                    <Col>{cheque.uploadDate}</Col>
                    <Col>{cheque.payerAccount}</Col>
                    <Col>{cheque.payeeAccount}</Col>
                  </Row>
                </ListGroup.Item>
              );
            })}
        </ListGroup>
        <RenderPages />
      </Card>
      {chequesList.map((chequeTransaction) => {
        return (
          <Modal
            key={"modal" + chequeTransaction.chequeId}
            size="xl"
            show={showModal === chequeTransaction.chequeId}
            onHide={() => setShowModal(false)}
            centered
          >
            <Modal.Header
              closeButton
              closeVariant="white"
              className="bg-secondary text-white"
            >
              Transaction # {chequeTransaction.chequeId}
            </Modal.Header>
            <Modal.Body>
              <Row className="justify-content-md-center">
                <Col>
                  <img
                    src={`http://localhost:3001/admin/chequeImage/${chequeTransaction.chequeId}/${token}`}
                    width="700px"
                  ></img>
                </Col>
                <Col>
                  <ListGroup>
                    <ListGroup.Item>
                      <Row>
                        <Col>Payee name: </Col>
                        <Col>
                          {chequeTransaction.firstName}{" "}
                          {chequeTransaction.lastName}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Upload date: </Col>
                        <Col>{chequeTransaction.uploadDate}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Value on cheque: </Col>
                        <Col>{chequeTransaction.originValue}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Payer account number</Col>
                        <Col>{chequeTransaction.payerAccount}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Cheque number</Col>
                        <Col>{chequeTransaction.chequeNumber}</Col>
                      </Row>
                    </ListGroup.Item>
                  </ListGroup>
                  <Row className="justify-content-md-center m-3">
                    <Col>
                      <Button
                        onClick={() => setApprove(chequeTransaction.chequeId)}
                      >
                        Approve Cheque
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        onClick={() => setDeny(chequeTransaction.chequeId)}
                      >
                        Deny Cheque
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Modal.Body>
          </Modal>
        );
      })}
    </div>
  );
}

export default ApproveCheques;
