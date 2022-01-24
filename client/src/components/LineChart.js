import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import { reqHeader } from "../misc/reqHeader";
import { Col } from "react-bootstrap";

function LineChart() {
  const [chartData, setChartData] = useState({});

  function myFunction() {
    var today = new Date();
    var month = today.getMonth();
    return daysInMonth(month + 1, today.getFullYear());
  }

  function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long' });

  useEffect(() => {
    axios
      .get("/transactions/charts/dailyTransactions", reqHeader)
      .then((response) => {
        const data = response.data;
        // console.log(data);
        // console.log(myFunction());
        const days = myFunction();

        let dates = new Array(days);
        new Promise((resolve, reject) => {
            for(let i = 0; i < dates.length; i++){
                dates[i] = 0;
            }
        
            for (let i = 0; i < data.length; i++) {
                console.log(data);
              let d = new Date(data[i].transactionDate);
              let day = d.getDate();
              dates[day] = (data[i].count);
            }
            resolve(dates)
        }).then((resolve)=>{
            console.log("dates");
            console.log(resolve);
        })
        // console.log("dates");
        // console.log(dates);

        setChartData({
          labels: dates.map((count, index) => index +1),
          datasets: [
            {
              label: "transactions",
              data: dates.map((count) => count),
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
        
        <Line data={chartData} />
        <h4>Daily Transactions in {month}</h4>
    </div>
  );
}

export default LineChart;