const axios = require("axios");
const AWS = require("aws-sdk");
const fs = require("fs");
const multiparty = require("multiparty");
const detect = require("detect-file-type");
const {Cheques} = require("../models");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Create S3 service object
var s3 = new AWS.S3({ apiVersion: "2006-03-01" });

function uploadCheque(req) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    form.parse(req, async (error, fields, files) => {
      if (error) {
        reject(error);
      }
      try {
        const path = files.file[0].path;
        const buffer = fs.readFileSync(path);
        let type = "jpg";
        await detect.fromBuffer(buffer, (err, result) => {
          type = result.ext;
        });
        const fileName = `cheques/${Date.now().toString()}`;
        const data = await uploadToS3(buffer, fileName, type);
        console.log(data);
        resolve(data);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  });
}

async function downloadCheque(chequeId) {
    return new Promise((resolve, reject) => {
        Cheques.findByPk(chequeId).then((result1) => {
            downloadFromS3(result1.s3key).then((result2) => {
                console.log("result2")
                console.log(result2)
                resolve(result2);
            }).catch((error) => {
                console.log("error" + error);
                reject(err);
            })
        }).catch((err) => {
            console.log("err: " + err);
            reject(err);
        })
    })
}

const downloadFromS3 = async (key) => {
  const downloadParams = {
    Bucket: process.env.S3BUCKET,
    Key: key,
  };

  return await s3.getObject(downloadParams).promise();
};

const uploadToS3 = async (buffer, name, type) => {
  const uploadParams = {
    Bucket: process.env.S3BUCKET,
    Key: name + "." + type,
    Body: buffer,
  };

  // call S3 to retrieve upload file to specified bucket
  return await s3.upload(uploadParams).promise();
};

const exchangeCurrency = async (originCurrency, targetCurrency, value) => {
  return await new Promise((resolve, reject) => {
    if (targetCurrency !== originCurrency) {
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

module.exports = { exchangeCurrency, downloadFromS3, uploadCheque, downloadCheque };
