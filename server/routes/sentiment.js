const express = require("express");
const logger = require("morgan");
const router = express.Router();
const redis = require("redis")

const { parseTwitterDate, sentimentAnalysis } = require('../helpers/SentimentAnalysisHelper')
const Twitter = require("../helpers/TwitterHelper");
const S3 = require("../helpers/AWSBucketHelper");
const redisClient = redis.createClient();
const AWS = require('aws-sdk');

const SESConfig = {
  apiVersion: "2010-12-01",
  accessKeyId: process.env.aws_access_key_id,
  accessSecretKey: process.env.aws_secret_access_key,
  region: "ap-southeast-2"
}
AWS.config.update(SESConfig);

redisClient.on("error", (err) => {
  console.log("Error " + err);
});

router.use(logger("tiny"));

// TODO: Implement sentiment analysis on Reddit and News post titles
// At the moment I have installed the 'sentiment' Node.js but we could
// change this to something else if there is a better package

router.get("/twitter/:search", (req, res) => {
  let searchParam = req.params.search;

  function updatePersistance(key, data) {
    // Store in Redis cache
    redisClient.setex(key, 3600, JSON.stringify(data));

    // Store in s3
    S3.uploadObject('cryptomate-bucket', `twitter-${key}`, JSON.stringify(data)).then((data) => {
      console.log("Uploaded in: ", data.Bucket)
    })
      .catch((error) => {
        return res.json({ Error: true, Details: error.message });
      })
  }

  // Check Redis
  redisClient.get(searchParam, (err, result) => {
    if (result) {
      // Serve from cache if in Redis
      let tweets = JSON.parse(result);

      // Get most recent tweet
      // Performance will get worse the larger the dataset
      const mostRecentTweet = tweets.posts.reduce((a, b) => {
        return new Date(parseTwitterDate(a.created_at)) > new Date(parseTwitterDate(b.created_at)) ? a : b;
      });

      // Check to see if there are any new tweets
      Twitter.getAllSinceTweets(`q=${searchParam}&since_id=${mostRecentTweet.tweet_id}&count=100&result_type=most_recent`, new Array).then(result => {
        if (result.length > 0) {
          const newTweetSet = tweets.posts
          result.forEach((post) => {
            newTweetSet.push(post)
          })
          // Re-run sentiment analysis on datastore with newly retrieved data
          const newResults = sentimentAnalysis(newTweetSet);
          // Update Redis cache
          redisClient.setex(searchParam, 3600, JSON.stringify(newResults));

          return res.json(newResults);
        } else {
          return res.json(tweets);
        }
      }).catch((error) => {
        console.log(error.message)
        return res.json({ Error: true, Details: error.message });
      });
    } else {
      // Check S3
      S3.getObject('cryptomate-bucket', `twitter-${searchParam}`).then((data) => {
        if (data) {
          let tweets = JSON.parse(data.Body)

          // Get most recent tweet
          // Performance will get worse the larger the dataset
          const mostRecentTweet = tweets.posts.reduce((a, b) => {
            return new Date(parseTwitterDate(a.created_at)) > new Date(parseTwitterDate(b.created_at)) ? a : b;
          });

          // // Check to see if there are any new tweets
          Twitter.getAllSinceTweets(`q=${searchParam}&since_id=${mostRecentTweet.tweet_id}&count=100&result_type=most_recent&include_entities=1`, new Array).then(result => {
            if (result.length > 0) {
              const newTweetSet = tweets.posts
              result.forEach((post) => {
                newTweetSet.push(post)
              })
              // Re-run sentiment analysis on datastore with newly retrieved data
              const newResults = sentimentAnalysis(newTweetSet);

              updatePersistance(searchParam, newResults);
              return res.json(newResults);
            } else {
              redisClient.setex(searchParam, 3600, JSON.stringify(tweets));
              return res.json(tweets);
            }
          }).catch((error) => {
            console.log(error.message)
            return res.json({ Error: true, Details: error.message });
          });
        } else {
          // Get tweets from twitter API
          Twitter.getAllTweets(`q=${searchParam}&count=100&include_entities=1&result_type=most_recent`, new Array, 100).then(data => {
            const tweets = sentimentAnalysis(data);
            updatePersistance(searchParam, tweets);
            return res.json(tweets);
          }).catch((error) => {
            return res.json({ Error: true, Details: error.message });
          })

        }
      }).catch((error) => {
        res.json({ Error: true, Details: error.message });
      })
    }
  })
})

module.exports = router;
