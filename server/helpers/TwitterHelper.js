var Twitter = require('twitter');

// Twitter API details
const apikey = process.env.apikey;
const apiKeySecret = process.env.apikeysecret;
const accessToken = process.env.accesstoken;
const accessTokenSecret = process.env.accesstokensecret;

var client = new Twitter({
  consumer_key: apikey,
  consumer_secret: apiKeySecret,
  access_token_key: accessToken,
  access_token_secret: accessTokenSecret
});

module.exports = {
    getTweets: function(searchParam) {
        return new Promise((resolve, reject) => {
          // q - Search query
          // count - Number of tweets to return in one request (100 is max)
          // result_type - Mixed, Recent, or Popular
          client.get('search/tweets', {q: searchParam, count: 5, result_type: 'mixed', include_entities: true}, function(error, tweets, response) {
            let twitterResults = [];
            if (!error) {
              for (let i = 0; i < tweets.statuses.length; i++) {
                  let dataObj = {};
                  dataObj["tweet_text"] = tweets.statuses[i].text;
                  dataObj["user"] = tweets.statuses[i].user.screen_name;
                  dataObj["user_profile_img"] = tweets.statuses[i].user.profile_image_url_https;
                  dataObj["created_at"] = tweets.statuses[i].created_at;
                  twitterResults.push(dataObj);
              }
              return resolve(twitterResults)
            } else {
              return reject(error);
            }
          })
        })
    }
  }