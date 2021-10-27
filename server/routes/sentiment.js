const express = require("express");
const axios = require("axios");
const https = require("https");
const logger = require("morgan");
const router = express.Router();
const redis = require("redis")
var Sentiment = require("sentiment");
var sentiment = new Sentiment();

const { getSentimentResults, formatTwitterResults, getSentimentScores, findAverage, getKeywords, parseTwitterDate } = require('../helpers/SentimentAnalysisHelper')
const Twitter = require("../helpers/TwitterHelper");
const S3 = require("../helpers/AWSBucketHelper");
const redisClient = redis.createClient();

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

          let sentimentResults = getSentimentResults(newTweetSet)
          let sentimentScores = getSentimentScores(sentimentResults)
          let averageScore = findAverage(sentimentScores)
          let keywords = getKeywords(sentimentResults)
          let newResults = formatTwitterResults(sentimentResults, newTweetSet, averageScore, keywords)

          // Update Redis cache
          redisClient.setex(key, 3600, JSON.stringify(newResults));

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

              let sentimentResults = getSentimentResults(newTweetSet)
              let sentimentScores = getSentimentScores(sentimentResults)
              let averageScore = findAverage(sentimentScores)
              let keywords = getKeywords(sentimentResults)
              let newResults = formatTwitterResults(sentimentResults, newTweetSet, averageScore, keywords)

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

            let sentimentResults = getSentimentResults(data)
            let sentimentScores = getSentimentScores(sentimentResults)
            let averageScore = findAverage(sentimentScores)
            let keywords = getKeywords(sentimentResults)
            let tweets = formatTwitterResults(sentimentResults, data, averageScore, keywords)

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



// Old Endpoints from assignment 1 below for reference (will delete later)

// router.get("/reddit/:search/:limit", (req, res) => {
//   let searchParam = req.params.search;

//   let limitParam = req.params.limit;

//   let redditResults = [];

//   // Used for finding average senmtiment score
//   let sentimentScores = [];

//   // Final aggregated results from both APIs
//   let results = {
//     averages: {
//       average_score: 0,
//       post_types: [],
//     },
//     posts: [],
//   };

//   const redditEndpoint = `http://www.reddit.com/search.json?limit=${limitParam}`;
//   const sentimentEndpoint =
//     "https://twinword-sentiment-analysis.p.rapidapi.com/analyze/";

//   // Throw error if query format is incorrect

//   axios
//     .get(`${redditEndpoint}&q=${searchParam}`)
//     .then((response) => response.data)
//     .then((data) => {
//       for (let i = 0; i < data.data.children.length; i++) {
//         let dataObj = {};
//         dataObj["post_title"] = data.data.children[i].data.title;
//         dataObj["subreddit"] =
//           data.data.children[i].data.subreddit_name_prefixed;
//         dataObj["author"] = data.data.children[i].data.author_fullname;
//         dataObj["post_url"] = data.data.children[i].data.url;
//         redditResults.push(dataObj);
//       }
//       return redditResults;
//     })
//     .then((data) => {
//       let promises = [];
//       for (let i = 0; i < data.length; i++) {
//         var options = {
//           method: "GET",
//           url: sentimentEndpoint,
//           params: { text: data[i].post_title },
//           headers: {
//             "x-rapidapi-host": "twinword-sentiment-analysis.p.rapidapi.com",
//             "x-rapidapi-key": process.env.SENTIMENT_API_KEY,
//           },
//         };
//         promises.push(
//           axios
//             .request(options)
//             .then(function (response) {
//               sentimentScores.push(response.data.score);
//               results.averages.post_types.push(response.data.type);
//               return response;
//             })
//             .catch((err) => {
//               console.log(err.response);
//               res.json({ Error: true, Message: err.response });
//             })
//         );
//       }
//       return promises;
//     })
//     .then((promises) => {
//       Promise.all(promises).then((responses) => {
//         for (let i = 0; i < responses.length; i++) {
//           let dataObj = {};
//           dataObj["post_title"] = redditResults[i].post_title;
//           dataObj["subreddit"] = redditResults[i].subreddit;
//           dataObj["author"] = redditResults[i].author;
//           dataObj["post_url"] = redditResults[i].post_url;
//           dataObj["sentiment_data"] = responses[i].data;
//           results.posts.push(dataObj);
//         }

//         // Get average score
//         const sumScore = sentimentScores.reduce((a, b) => a + b, 0);
//         const avgScore = sumScore / sentimentScores.length || 0;
//         results.averages.average_score = avgScore;

//         res.json(results);
//       });
//     })
//     .catch((err) => {
//       console.log(err.response);
//       res.json({ Error: true, Message: err.response });
//     });
// });

// router.get("/news/:query/:limit", (req, res) => {
//   let query = req.params.query;

//   let limitParam = req.params.limit;

//   let newsResults = [];

//   // Used for finding average senmtiment score
//   let sentimentScores = [];

//   // Final aggregated results from both APIs
//   let results = {
//     averages: {
//       average_score: 0,
//       post_types: [],
//     },
//     posts: [],
//   };

//   const newsEndpoint = `https://api.currentsapi.services/v1/search?keywords=${query}&apiKey=${process.env.NEWS_API_KEY}&page_size=${limitParam}`;
//   const sentimentEndpoint =
//     "https://twinword-sentiment-analysis.p.rapidapi.com/analyze/";

//   axios
//     .get(newsEndpoint)
//     .then((response) => {
//       newsResults = response.data.news;
//       return response.data.news;
//     })
//     .then((data) => {
//       let promises = [];
//       for (let i = 0; i < data.length; i++) {
//         var options = {
//           method: "GET",
//           url: sentimentEndpoint,
//           params: { text: data[i].title },
//           headers: {
//             "x-rapidapi-host": "twinword-sentiment-analysis.p.rapidapi.com",
//             "x-rapidapi-key": process.env.SENTIMENT_API_KEY,
//           },
//         };
//         promises.push(
//           axios
//             .request(options)
//             .then(function (response) {
//               sentimentScores.push(response.data.score);
//               results.averages.post_types.push(response.data.type);
//               return response;
//             })
//             .catch((err) => {
//               console.log(err.response);
//               res.json({ Error: true, Message: err.response });
//             })
//         );
//       }
//       return promises;
//     })
//     .then((promises) => {
//       Promise.all(promises).then((responses) => {
//         for (let i = 0; i < responses.length; i++) {
//           let dataObj = {};
//           dataObj["post_title"] = newsResults[i].title;
//           dataObj["description"] = newsResults[i].description;
//           dataObj["url"] = newsResults[i].url;
//           dataObj["published"] = newsResults[i].published;
//           dataObj["image"] = newsResults[i].image;
//           dataObj["sentiment_data"] = responses[i].data;
//           results.posts.push(dataObj);
//         }

//         // Get average score
//         const sumScore = sentimentScores.reduce((a, b) => a + b, 0);
//         const avgScore = sumScore / sentimentScores.length || 0;
//         results.averages.average_score = avgScore;

//         res.json(results);
//       });
//     })
//     .catch((err) => {
//       console.log(err.response);
//       res.json({ Error: true, Message: err.response });
//     });
// });

module.exports = router;
