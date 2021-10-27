var Sentiment = require("sentiment");
var sentiment = new Sentiment();

function cleanData(data) {
    regex = /(@\w*)|((?:https?):\/\/[\n\S]+)|RT/g
    let newstring = data.replace(regex, '')
    return newstring
}

function getSentimentResults(data) {
    let sentimentResults = [];

    data.forEach((post) => {
        // Removes @ mentions in the tweets
        let cleanTweet = cleanData(post.tweet_text)
        // Perform sentiment analysis
        var sentResult = sentiment.analyze(cleanTweet);
        sentimentResults.push(sentResult);
    });
    return sentimentResults;
}

function getAllScores(data) {
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
}

/**
 * Formats the sentiment analysis
 * @param  {Array<Object>} sentimentResults 
 * @param  {Array<Object>} twitterResults 
 * @param  {Integer} averageScore 
 * @param  {Array<String>} keywords 
 * @returns {Object} Formatted sentiment results
 */
function formatTwitterResults(sentimentResults, twitterResults, averageScore, keywords) {
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

    for (let i = 0; i < sentimentResults.length; i++) {
        let dataObj = {};
        dataObj["user"] = twitterResults[i].user;
        dataObj["tweet_id"] = twitterResults[i].tweet_id;
        dataObj["tweet_text"] = twitterResults[i].tweet_text;
        dataObj["tweet_url"] = twitterResults[i].tweet_url;
        dataObj["user_profile_img"] = twitterResults[i].user_profile_img;
        dataObj["created_at"] = twitterResults[i].created_at;
        dataObj["sentiment_data"] = sentimentResults[i];

        if (sentimentResults[i].score === 0) {
            tweets.averages.all_scores.neutral += 1;
        } else if (sentimentResults[i].score < 0) {
            tweets.averages.all_scores.negative += 1;
        } else if (sentimentResults[i].score > 0) {
            tweets.averages.all_scores.positive += 1;
        }

        tweets.posts.push(dataObj);
    }

    tweets.averages.average_score = averageScore
    tweets.averages.keywords = keywords
    return tweets;
}

function getSentimentScores(ObjArray) {
    let scores = ObjArray.map(obj => obj.score)
    return scores
}

/**
 * Finds average
 * @param  {Array<Integer>} wordArray 
 * @returns {Integer} Average score
 */
function findAverage(scores) {
    const sumScore = scores.reduce((a, b) => a + b, 0);
    const avgScore = sumScore / scores.length || 0;
    return avgScore;
}

/**
 * Gets unique keywords
 * @param  {Array<String>} wordArray 
 * @returns {Array<String>} Keywords
 */
function getKeywords(wordArray) {
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
}

/**
 * Returns a new date from string ("Wed Oct 27 10:53:05 +0000 2021")
 * @param  {String} aDate 
 */
function parseTwitterDate(aDate) {
    return new Date(Date.parse(aDate.replace(/( \+)/, ' UTC$1')));
    //sample: Wed Mar 13 09:06:07 +0000 2013 
}

/**
 * Performs a sentiment analysis
 * @param  {Array<Object>} dataToAnalyse 
 * @returns {Object} Sentiment analysis results
 */
function analyseAndFormat(dataToAnalyse) {
    let sentimentResults = getSentimentResults(dataToAnalyse)
    let sentimentScores = getSentimentScores(sentimentResults)
    let averageScore = findAverage(sentimentScores)
    let keywords = getKeywords(sentimentResults)
    let newResults = formatTwitterResults(sentimentResults, dataToAnalyse, averageScore, keywords)
    return newResults;
}

module.exports = {
    getSentimentResults: getSentimentResults,
    getAllScores: getAllScores,
    formatTwitterResults: formatTwitterResults,
    getSentimentScores: getSentimentScores,
    findAverage:findAverage,
    getKeywords: getKeywords,
    parseTwitterDate: parseTwitterDate,
    analyseAndFormat: analyseAndFormat
}
