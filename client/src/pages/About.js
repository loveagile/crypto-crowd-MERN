import React from "react";

function About() {
  return (
    <div className="container">
      <div className="custom-box-shadow my-5 p-4 rounded">
        <div className="question my-2">
          <h3>What is Sentiment Analysis</h3>
          <ul>
            <li>Sentiment analysis (or opinion mining) uses NLP to determine whether
            data is positive, negative or neutral. We use sentiment analysis on
            cryptocurrency related tweets to help people make better investment
            decisions.</li>
            <li className="my-2">
             AFINN is a list of words rated for valence with an integer between minus five (negative) and plus five (positive). Sentiment analysis is performed by cross-checking the string tokens (words, emojis) with the AFINN list and getting their respective scores. 
            </li>
            <li>
            While the accuracy provided by AFINN is quite good considering it's computational performance there is always room for improvement.
            </li>
          </ul>
          
        </div>

        <div className="question my-4">
          <h3>Technologies</h3>
          <ul>
            <li>
              <a
                href="https://developer.twitter.com/en/docs/twitter-api"
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none"
              >
                Twitter API
              </a>
            </li>
            <li>
              <a
                href="https://github.com/thisandagain/sentiment"
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none"
              >
                Sentiment Node.js module
              </a>
            </li>
          </ul>
        </div>
        <div className="question my-4">
          <h3>Interpreting Sentiment Analysis</h3>
          <ul>
            <li>If the score is <span className="fw-bold">greater than</span> 1.0 then the sentiment is positive</li>
            <li>If the score is <span className="fw-bold">less than</span> 1.0 then the sentiment is negative</li>
            <li>If the score is <span className="fw-bold">equal to</span> 1.0 then the sentiment is neutral</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default About;
