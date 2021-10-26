var Twitter = require('twitter');

// Twitter API details
const apikey = process.env.apikey;
const apiKeySecret = process.env.apikeysecret;
const bearerToken = process.env.bearertoken;

var client = new Twitter({
  consumer_key: apikey,
  consumer_secret: apiKeySecret,
  bearer_token: bearerToken
});

function userDetails(tweet) {
    return  {tweet_id: tweet.id, tweet_text: tweet.text, tweet_url: tweet.entities.urls[0]?.url,  user: tweet.user.screen_name, user_profile_img: tweet.user.profile_image_url_https, created_at: tweet.created_at}
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
              console.log("Request here") // For testing
              return resolve(newTweets)
            } else {
              return reject(error);
            }
          })
        })
    },
    //Checks for new tweets
    refreshTweets: function (queryString) {
      return new Promise((resolve, reject) => {
          // const params = {
          //     screen_name: accountname,
          //     tweet_mode: "extended",
          //     since_id: lastID
          // }

          // turn querystring into an object
          const urlParams = new URLSearchParams(queryString);
          const ent = urlParams.entries()
          const objectParams = paramsToObject(ent)

          T.get('statuses/user_timeline', params, function (err, data, response) {
              let newTweets = [];
              if (data.length > 0) {
                  data.map(result => {
                      const tweet = {}
                      tweet.id = result.id
                      tweet.text = result.full_text;
                      tweet.date = new Date(result.created_at);
                      newTweets.push(tweet);
                  })
              }
              if (!err) {
                  return resolve(newTweets);
              }
              else {
                  reject(err);
              }
          })
      })
  }
  }