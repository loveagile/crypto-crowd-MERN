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
  return { tweet_id: tweet.id, tweet_text: tweet.text, tweet_url: tweet.entities.urls[0].url, user: tweet.user.screen_name, user_profile_img: tweet.user.profile_image_url_https, created_at: tweet.created_at }
}

// create and object from a query string
function paramsToObject(entries) {
  const result = {}
  for (const [key, value] of entries) { // each 'entry' is a [key, value] tupple
    result[key] = value;
  }
  return result;
}

module.exports = {
  /**
   * Gets tweets
   * @param  {} queryString Twitter queryString
   */
  getTweets: function (queryString) {
    return new Promise((resolve, reject) => {
      // turn querystring into an object
      const urlParams = new URLSearchParams(queryString);
      const ent = urlParams.entries()
      const objectParams = paramsToObject(ent)

      client.get('search/tweets', objectParams, function (error, tweets, response) {
        if (!error) {
          const newTweets = { tweets: tweets.statuses.map(userDetails), search_metadata: tweets.search_metadata }
          console.log("Request here") // For testing
          return resolve(newTweets)
        } else {
          return reject(error);
        }
      })
    })
  },

  /**
   * Recursively gets all tweets
   * @param  {} queryString Twitter queryString
   * @param  {} newResults Empty array for collecting new tweets
   * @param  {} limit used to limit amount of recursive tweets
   */
  getAllTweets: function (queryString, newResults, limit) {
    // Get tweets from helper function
    return this.getTweets(queryString).then((data) => {
      // add newly returned tweets into newResults
      data.tweets.forEach((tweet) => {
        newResults.push(tweet)
      })
      if (newResults.length >= limit) {
        return newResults;
      } else {
        // take the next_results querystring and recursively calls it
        let newQuerysting = data.search_metadata.next_results
        return this.getAllTweets(newQuerysting, newResults, 100);
      }
    })
  },

  /**
   * Recursively gets all recent tweets
   * @param  {} queryString Twitter queryString
   * @param  {} newResults Empty array for collecting new tweets
   */
  getAllSinceTweets: function(queryString, newResults) {
    // Get tweets from helper function
    return this.getTweets(queryString).then((data) => {
      // add newly returned tweets into newResults
      data.tweets.forEach((tweet) => {
        newResults.push(tweet)
      })
      if (data.tweets.length == 0) {
        // No more new tweets
        return newResults;
      } else {
        // take the refresh_url querystring and recursively calls it
        // uses since_id to get the most recent twitter posts
        let newQuerysting = data.search_metadata.refresh_url + '&count=100'
        return this.getAllSinceTweets(newQuerysting, newResults);
      }
    })
  }
}
