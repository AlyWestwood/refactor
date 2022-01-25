const axios = require("axios");
const AWS = require("aws-sdk");
const fs = require("fs");

const detect = require("detect-file-type");
const { Cheques } = require("../models");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create S3 service object
var s3 = new AWS.S3({ apiVersion: "2006-03-01" });

function uploadCheque(path) {
  return new Promise((resolve, reject) => {
    const buffer = fs.readFileSync(path);
    detect.fromBuffer(buffer, (err, result) => {
      type = result.ext;
      const fileName = `cheques/${Date.now().toString()}`;
      uploadToS3(buffer, fileName, type).then((result) => {
        console.log(result);
        resolve(result);
      }).catch((err) =>{
        reject(err);
      });
    });
  });
}

 function downloadCheque(chequeId) {
  return new Promise((resolve, reject) => {
    Cheques.findByPk(chequeId)
      .then((result1) => {
        downloadFromS3(result1.s3key)
          .then((result2) => {
            resolve(result2);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

const downloadFromS3 = (key) => {
  const downloadParams = {
    Bucket: process.env.S3BUCKET,
    Key: key,
  };
  return s3.getObject(downloadParams).promise();
};

const uploadToS3 = (buffer, name, type) => {
  const uploadParams = {
    Bucket: process.env.S3BUCKET,
    Key: name + "." + type,
    Body: buffer,
  };
  return s3.upload(uploadParams).promise();
};

const exchangeCurrency = async (originCurrency, targetCurrency, value) => {
  return await new Promise((resolve, reject) => {
    if (targetCurrency !== originCurrency && value != 0) {
      const url =
        "https://v6.exchangerate-api.com/v6/" +
        process.env.EXCHANGEAPIKEY +
        "/pair/" +
        originCurrency +
        "/" +
        targetCurrency +
        "/" +
        value;
      axios
        .get(url)
        .then((response) => {
          console.log(response.data.conversion_result);
          resolve(response.data.conversion_result);
        })
        .catch((err) => reject(err));
    } else {
      resolve(value);
    }
  });
};

module.exports = {
  exchangeCurrency,
  downloadFromS3,
  uploadToS3,
  downloadCheque,
  uploadCheque,
};
