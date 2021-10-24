const express = require("express");
const axios = require("axios");
const https = require("https");
const logger = require("morgan");
const router = express.Router();
const redis = require("redis")
var Sentiment = require("sentiment");
var sentiment = new Sentiment();
const AWS = require("aws-sdk");

const TwitterHelper = require("../helpers/TwitterHelper");

const redisClient = redis.createClient();

redisClient.on("error", (err) => {
  console.log("Error " + err);
});

router.use(logger("tiny"));

router.get("/twitter/:search", (req, res) => {
  let searchParam = req.params.search;

  let twitterResults = [];

  // Used for finding average senmtiment score
  let sentimentScores = [];

  // Final aggregated results from both APIs
  let results = {
    averages: {
      average_score: 0,
    },
    posts: [],
  };
  
  function getAllTweets(queryString, limit) {
    // Get tweets from helper function
    return TwitterHelper.getTweets(queryString).then((data) => {
      // add newly returned tweets into twitterResults
      data.tweets.forEach((tweet) => {
        twitterResults.push(tweet)
      })

      if (twitterResults.length == limit) {
        return twitterResults;
      } else {
        // take the next_results querystring and recursively calls it
        let newQuerysting = data.search_metadata.next_results
        return getAllTweets(newQuerysting, 100);
      }
    })
  }

  return redisClient.get(searchParam, (err, result) => {
    if (result) {
      // Serve from cache if in Redis
      const resultJSON = JSON.parse(result);
      console.log("Found in cache");
      return res.status(200).json(resultJSON);
    } else {
      console.log("Didnt find in cache");
      getAllTweets(`q=${searchParam}&count=100&include_entities=1&result_type=mixed`, 100).then(data => {

        // Perform sentiment analysis
        let sentimentResults = [];
        data.forEach((post) => {
          // Perform sentiment analysis
          var sentResult = sentiment.analyze(post.tweet_text);
          sentimentResults.push(sentResult);
        });
        return sentimentResults;
        }).then((data) => {
          // Format twitter data and sentiment data together
          for (let i = 0; i < data.length; i++) {
            let dataObj = {};
            dataObj["user"] = twitterResults[i].user;
            dataObj["tweet_text"] = twitterResults[i].tweet_text;
            dataObj["tweet_url"] = twitterResults[i].tweet_url;
            dataObj["user_profile_img"] = twitterResults[i].user_profile_img;
            dataObj["created_at"] = twitterResults[i].created_at;
            dataObj["sentiment_data"] = data[i];
    
            // Store score so we can perform and average later
            sentimentScores.push(data[i].score)
            results.posts.push(dataObj);
          }
    
          // Get average score
          const sumScore = sentimentScores.reduce((a, b) => a + b, 0);
          const avgScore = sumScore / sentimentScores.length || 0;
          results.averages.average_score = avgScore;
    
          // Store in cache
          redisClient.setex(searchParam, 3600, JSON.stringify(results));
    
          res.json(results);
        }).catch((err) => {
          res.json({ Error: true, Details: err.response });
        });
    }
  });
});

  

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
