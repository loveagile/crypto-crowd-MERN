require('dotenv').config();
const AWS = require('aws-sdk');
const S3 = new AWS.S3();

function keyExists(value) {
    if (value == "NoSuchKey") return false
    else return true
}

module.exports = {

    uploadObject: function (Bucket, Key, Body) {
        return new Promise((resolve, reject) => {
            S3.upload({ Bucket, Key, Body }, function (err, data) {
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

    getObject: function (Bucket, Key) {
        return new Promise((resolve, reject) => {
            S3.getObject({ Bucket, Key }, function (err, data) {
                //success
                if (data) {
                    resolve(data);
                }
                //handle error
                if (err) {
                    if (!keyExists(err.code)) {
                        return resolve(false)
                    }
                    reject(err)
                }
            });
        })
    },
}