import React, { useState, useContext, useEffect } from "react";
import axios from "axios";

function DisplayCheque() {
  const [image, setImage]  = useState("");

useEffect(() => {
    axios.get("/transactions/cheques/1", {
        headers: {
          accessToken: localStorage.getItem("access-token"),
        }}).then((result) => {
      setImage(result.data);
    }).catch((err) => {
        console.log(err);
    });
}, [])

  return (
    <div>
      <img src={`data:image/jpeg;base64,${image}`} />
    </div>
  );
}

export default DisplayCheque;
