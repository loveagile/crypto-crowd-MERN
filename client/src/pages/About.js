import React from "react";

function About() {
  return (
    <div className="container">
      <div className="custom-box-shadow my-5 p-4 rounded">
        <div className="question my-2">
          <h3>What is Sentiment Analysis</h3>
          <p>
            Sentiment analysis (or opinion mining) uses NLP to determine whether
            data is positive, negative or neutral. We use sentiment analysis on
            cryptocurrency related tweets to help people make better investment
            decisions.
          </p>
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
          <ul>{/* TODO: Update this section */}</ul>
        </div>
      </div>
    </div>
  );
}

export default About;
