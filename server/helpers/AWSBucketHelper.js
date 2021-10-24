require('dotenv').config();
const AWS = require('aws-sdk');

var s3 = new AWS.S3();

module.exports = {

    keyExists: function (value) {
        if (value.code == "NoSuchKey") return false
        else return true
    },

    upload: function (params) {
        return new Promise((resolve, reject) => {

            s3.upload(params, function (err, data) {

                //success
                if (data) {
                    resolve("Uploaded in:", data.Location);
                }
                //handle error
                if (err) {
                    reject(err)
                }

            });
        })
    },

    getObj: function (params) {
        return new Promise((resolve, reject) => {

            s3.getObject(params, function (err, data) {

                //success
                if (data) {
                    resolve(data);
                }
                //handle error
                if (err) {
                    reject(err)
                }

            });
        })
    },

    // createBucket: function (bucketName) {
    //     return new Promise((resolve, reject) => {

    //         // Create a promise on S3 service object
    //         const bucketPromise = new AWS.S3({ apiVersion: '2006-03-01' }).createBucket({ Bucket: bucketName }).promise();
    //         bucketPromise.then(function (data) {
    //             resolve("Successfully created " + bucketName);
    //         })
    //         .catch(function (err) {
    //             reject(err)
    //         });
    //     })
    // }

}