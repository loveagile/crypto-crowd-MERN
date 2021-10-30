var Sentiment = require("sentiment");
var sentiment = new Sentiment();

/**
 * Removes @ symbol from tweet text
 * @param  {String} data 
 * @returns {String} String with '@' removed
 */
function cleanData(data) {
    regex = /(@\w*)|((?:https?):\/\/[\n\S]+)|RT/g
    let newstring = data.replace(regex, '')
    return newstring
}

/**
 * Gets sentiments results
 * @param  {Array<Object>} data Data to be analysed 
 * @returns {Array<Object>} Sentiment results
 */
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

/**
 * Get the scores for all sentiment objects
 * @param  {Array<Object>} sentiments Sentiment data
 * @returns {Array} Sentiment scores
 */
function getSentimentScores(sentiments) {
    let scores = sentiments.map(sentiment => sentiment.score)
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
function getKeywords(newWords, oldWords) {
    let keywords = oldWords
    newWords.forEach(item => {
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
function sentimentAnalysis(dataToAnalyse) {
    let sentimentResults = getSentimentResults(dataToAnalyse)
    let sentimentScores = getSentimentScores(sentimentResults)
    let averageScore = findAverage(sentimentScores)
    let keywords = getKeywords(sentimentResults, new Array)
    let newResults = formatTwitterResults(sentimentResults, dataToAnalyse, averageScore, keywords)
    return newResults;
}

/**
 * Performs a sentiment re-analysis
 * Takes new results and appends them the already existing results
 * @param  {Array<Object>} newResults New data to be analysed
 * @param  {Array<Object>} oldResults Existing data
 * @returns {Object} Sentiment analysis results
 */
function sentimentReAnalyse(newResults, oldResults) {
    let sentimentResults = getSentimentResults(newResults)
    let sentimentScores = getSentimentScores(sentimentResults)
    let averageScore = findAverage(sentimentScores)
    let keywords = getKeywords(sentimentResults, oldResults.averages.keywords)

    // find combined mean average from new and old results
    oldResults.averages.average_score = ((oldResults.posts.length * oldResults.averages.average_score) + (sentimentScores.length * averageScore)) / (oldResults.posts.length + sentimentScores.length)
    oldResults.averages.keywords = keywords

    for (let i = 0; i < sentimentResults.length; i++) {
        let dataObj = {};
        dataObj["user"] = newResults[i].user;
        dataObj["tweet_id"] = newResults[i].tweet_id;
        dataObj["tweet_text"] = newResults[i].tweet_text;
        dataObj["tweet_url"] = newResults[i].tweet_url;
        dataObj["user_profile_img"] = newResults[i].user_profile_img;
        dataObj["created_at"] = newResults[i].created_at;
        dataObj["sentiment_data"] = sentimentResults[i];

        if (sentimentResults[i].score === 0) {
            oldResults.averages.all_scores.neutral += 1;
        } else if (sentimentResults[i].score < 0) {
            oldResults.averages.all_scores.negative += 1;
        } else if (sentimentResults[i].score > 0) {
            oldResults.averages.all_scores.positive += 1;
        }

        oldResults.posts.push(dataObj);
    }
    return oldResults;
}

module.exports = {
    getSentimentResults: getSentimentResults,
    formatTwitterResults: formatTwitterResults,
    getSentimentScores: getSentimentScores,
    findAverage: findAverage,
    getKeywords: getKeywords,
    parseTwitterDate: parseTwitterDate,
    sentimentAnalysis: sentimentAnalysis,
    sentimentReAnalyse: sentimentReAnalyse
}
