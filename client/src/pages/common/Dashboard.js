import React, { useState, useEffect } from "react";
import DonutChart from "../../components/DonutChart";
import LineChart from "../../components/LineChart";
import { Row, Col } from "react-bootstrap";

function Dashboard() {
  return (
    <div className="row justify-content-center ">
      <h3 className="m-4">Your data at a glance</h3>
        <Col>
        <DonutChart />
        </Col>
        <Col>
        <LineChart />
        </Col>
    </div>
  );
}

export default Dashboard;
