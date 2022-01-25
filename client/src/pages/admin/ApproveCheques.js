/* eslint-disable jsx-a11y/anchor-is-valid */
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
    if(!paginate || !paginate.currentPage){
      return <p>No cheques for approval</p>
    }
    let pages = [];
    if (paginate.currentPage > 1) {
      pages.push(<li className="page-item"><a className="page-link" onClick={() => {setPage(paginate.currentPage - 1);}}> Previous</a></li>);
    } else {
      pages.push( <li className="page-item disabled"><a className="page-link " onClick={() => {setPage(paginate.currentPage - 1);}}>Previous</a></li>);
    }
    for (let i = 1; i < paginate.totalPages + 1; i++) {
      if (i === paginate.currentPage) {
        pages.push(<li className="page-item active"><a className="page-link" onClick={() => {setPage(i);}}>{i}</a></li> );
      } else {
        pages.push(<li className="page-item"><a className="page-link" onClick={() => {setPage(i);}}>{i}</a> </li>);}
    }
    if (paginate.currentPage !== paginate.endPage) {
      pages.push(<li className="page-item"> <a className="page-link"  onClick={() => {setPage(Number(paginate.currentPage) + 1);}}>Next</a></li>);
    } else {
      pages.push(<li className="page-item disabled"> <a className="page-link " onClick={() => {setPage(Number(paginate.currentPage) + 1);}}> Next</a> </li>);
    }
    return <ul className="pagination m-3 justify-content-center">{pages}</ul>;
  }

  useEffect(() => {
    if (approve !== "") {
      const body = { status: "cleared", chequeId: approve };
      axios
        .put("/admins/approveCheque", body, reqHeader)
        .then((result) => {
          console.log(result);
          setSuccess(result.data);
          const timeout = setTimeout(() => setSuccess(""), 10000);
          setShowModal("");
        })
        .catch((error) => {
          setAlert(error.response.data);
          console.log(error.response.data);
          const timeout = setTimeout(() => setAlert(""), 10000);
          setShowModal("");
        });
      setApprove("");
    }

    if (deny !== "") {
      const body = { status: "denied", chequeId: deny };
      axios
        .put("/admins/approveCheque", body, reqHeader)
        .then((result) => {
          console.log(result);
          setSuccess(result.data);
          const timeout = setTimeout(() => setSuccess(""), 10000);
          setShowModal("");
          
        })
        .catch((error) => {
          setAlert(error.response.data);
          console.log(error.response.data);
          const timeout = setTimeout(() => setAlert(""), 10000);
          setShowModal("");
        });
      setDeny("");
    }
  }, [approve, deny, page]);

  useEffect(() =>{
    axios
    .get("/admins/approveCheques?page=" + page, reqHeader)
    .then((result) => {
      console.log(result.data);
      setChequesList(result.data.pageOfCheques);
      setPaginate(result.data.pager);
      // RenderPages();
    })
    .catch((err) => console.log(err));
  }, [page])

  return (
    <div>
      <h1>Approve Cheques</h1>
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
                  action
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
      {chequesList && chequesList.map((chequeTransaction) => {
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
                  <img src={`http://localhost:3001/admins/chequeImage/${chequeTransaction.chequeId}/${token}`} width="700px" alt="cheque"></img>
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
