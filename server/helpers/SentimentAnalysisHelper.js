var Sentiment = require("sentiment");
var sentiment = new Sentiment();

function cleanData(data) {
    regex = /(@\w*)|((?:https?):\/\/[\n\S]+)|RT/g
    let newstring = data.replace(regex, '')
    return newstring
}

module.exports = {
    getSentimentResults: function (data) {
        let sentimentResults = [];

        data.forEach((post) => {
            // Removes @ mentions in the tweets
            let cleanTweet = cleanData(post.tweet_text)

            // Perform sentiment analysis
            var sentResult = sentiment.analyze(cleanTweet);

            sentimentResults.push(sentResult);

        });

        return sentimentResults;
    },

    getAllScores: function(data) {
        data.forEach((post) => {
            // Record tally for positive, negative, neutral result (for pie chart)
            if (sentResult.score === 0) {
                results.averages.all_scores.neutral += 1;
            } else if (sentResult.score < 0) {
                results.averages.all_scores.negative += 1;
            } else if (sentResult.score > 0) {
                results.averages.all_scores.positive += 1;
            }
        });
        return data
    },

    formatTwitterResults: function (sentiemntResults, twitterResults, averageScore, keywords) {

        let tweets = {
            averages: {
                average_score: 0,
                all_scores: {
                    positive: 0,
                    negative: 0,
                    neutral: 0
                },
                keywords: []
            },
            posts: [],
        };

        for (let i = 0; i < sentiemntResults.length; i++) {
            let dataObj = {};
            dataObj["user"] = twitterResults[i].user;
            dataObj["tweet_id"] = twitterResults[i].tweet_id;
            dataObj["tweet_text"] = twitterResults[i].tweet_text;
            dataObj["tweet_url"] = twitterResults[i].tweet_url;
            dataObj["user_profile_img"] = twitterResults[i].user_profile_img;
            dataObj["created_at"] = twitterResults[i].created_at;
            dataObj["sentiment_data"] = sentiemntResults[i];

            if (sentiemntResults[i].score === 0) {
                tweets.averages.all_scores.neutral += 1;
            } else if (sentiemntResults[i].score < 0) {
                tweets.averages.all_scores.negative += 1;
            } else if (sentiemntResults[i].score > 0) {
                tweets.averages.all_scores.positive += 1;
            }

            tweets.posts.push(dataObj);
        }

        tweets.averages.average_score = averageScore
        tweets.averages.keywords = keywords


        return tweets;
    },

    getSentimentScores: function (ObjArray) {
        let scores = ObjArray.map(obj => obj.score)
        return scores
    },

    findAverage: function (scores) {
        const sumScore = scores.reduce((a, b) => a + b, 0);
        const avgScore = sumScore / scores.length || 0;
        return avgScore;
    },

    getKeywords: function (wordArray) {
        let keywords = []
        wordArray.forEach(item => {
            // Check if word is already in array
            item.words.forEach((word) => {
                if (!keywords.includes(word)) {
                    keywords.push(word);
                }
            })
        })
        return keywords;
    },

    parseTwitterDate: function (aDate) {
        return new Date(Date.parse(aDate.replace(/( \+)/, ' UTC$1')));
        //sample: Wed Mar 13 09:06:07 +0000 2013 
    }
}
