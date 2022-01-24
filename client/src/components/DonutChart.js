import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import axios from "axios";
import {reqHeader} from "../misc/reqHeader";
import { Row, Col } from "react-bootstrap";

function DonutChart() {
  const [donutChartData, setDonutChartData] = useState({});

  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    axios
      .get("/transactions/charts/cashFlow", reqHeader)
      .then((response) => {
        let paidValue = response.data.paidValue[0].totalPaid;
        let incomeValue = response.data.incomeValue[0].totalIncome;

        if (!incomeValue) {
          incomeValue = 0;
        }
        if (!paidValue) {
          paidValue = 0;
        }
        setDonutChartData({
          labels: ["Money paid out", "Revenue brought in"],
          datasets: [
            {
              label: "level",
              data: [paidValue, incomeValue],
              backgroundColor: [
                "rgba(187,182,223, 0.7)",
                "rgba(62,81,122, 0.7)",
              ],
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((error) => {});
  }, []);

  return (
    <div>
          
          <Doughnut data={donutChartData} />
          <h4>Total money withdrawn and depoisted in {month}</h4>
    </div>
  );
}

export default DonutChart;
