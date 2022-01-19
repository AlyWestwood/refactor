import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./misc/AuthContext";

function FileUpload() {

  const [file, setFile] = useState(null);

  const submitFile = async () => {
    try {
      if (!file) {
        throw new Error("Select a file first!");
      }
      const formData = new FormData();
      formData.append("file", file[0]);
      await axios.post(`/transactions/depositCheque`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          accessToken: localStorage.getItem("access-token"),
        },
      }).then((result) => {
        console.log(result);
      }).catch((err) => {
        console.log(err.response.data)
      })
      // handle success
    } catch (error) {
      // handle error
      console.log(error.data)
    }
  };

  return (
    <div>
      <form >
        <label>Upload file</label>
        <input type="file" onChange={(event) => setFile(event.target.files)} />
        <button type="button" onClick={submitFile}>Send</button>
      </form>
    </div>
  );
}

export default FileUpload;
