import React, { useState,} from "react";

function DisplayCheque() {
  const [chequeId]  = useState(1);
  const [token] = useState(localStorage.getItem("access-token"));

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
      <img src={`http://localhost:3001/admin/chequeImage/${chequeId}/${token}`} width="400px"></img>
      <img src={`http://localhost:3001/transactions/cheques/${chequeId}/${token}`}></img>
    </div>
  );
}

export default DisplayCheque;
