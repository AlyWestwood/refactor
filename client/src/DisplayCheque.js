import React, { useState, useContext, useEffect } from "react";
import axios from "axios";

function DisplayCheque() {
  const [chequeId, setChequeId]  = useState(1);
  const [token, setToken] = useState(localStorage.getItem("access-token"));

// useEffect(() => {
//     axios.get("/transactions/cheques/1", {
//         headers: {
//           accessToken: localStorage.getItem("access-token"),
//         }}).then((result) => {
//       setImage(result);
//     }).catch((err) => {
//         console.log(err);
//     });
// }, [])

  return (
    <div>
      <img src={`http://localhost:3001/admin/chequeImage/${chequeId}/${token}`}></img>
      <img src={`http://localhost:3001/transactions/cheques/${chequeId}/${token}`}></img>
    </div>
  );
}

export default DisplayCheque;
