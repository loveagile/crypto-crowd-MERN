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

function userDetails(tweet) {
    return  {tweet_text: tweet.text, user: tweet.user.screen_name, user_profile_img: tweet.user.profile_image_url_https, created_at: tweet.created_at}
}

// create and object from a query string
function paramsToObject(entries) {
  const result = {}
  for(const [key, value] of entries) { // each 'entry' is a [key, value] tupple
    result[key] = value;
  }
  return result;
}

module.exports = {

    getTweets: function(queryString) {
        return new Promise((resolve, reject) => {
          
          // turn querystring into an object
          const urlParams = new URLSearchParams(queryString);
          const ent = urlParams.entries()
          const objectParams = paramsToObject(ent)

          client.get('search/tweets', objectParams, function(error, tweets, response) {
            if (!error) {
              const newTweets = { tweets: tweets.statuses.map(userDetails), search_metadata: tweets.search_metadata}
              return resolve(newTweets)
            } else {
              return reject(error);
            }
          })
        })
    }
  }