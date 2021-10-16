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
            cryptocurrency related social media posts and news articles data to
            help people make better investment decisions.
          </p>
        </div>

        <div className="question my-4">
          <h3>APIs</h3>
          <p>We use the following APIs</p>
          <ul>
            <li>
              <a
                href="https://rapidapi.com/twinword/api/sentiment-analysis/details"
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none"
              >
                Twinword, Inc. Sentiment Analysis API
              </a>
            </li>
            <li>
              <a
                href="https://www.reddit.com/dev/api/"
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none"
              >
                Reddit API
              </a>
            </li>
            <li>
              <a
                href="https://currentsapi.services/en"
                target="_blank"
                rel="noreferrer"
                className="text-decoration-none"
              >
                Currents API (News)
              </a>
            </li>
          </ul>
        </div>
        <div className="question my-4">
          <h3>Interpreting Sentiment Analysis</h3>
          <ul>
            <li>
              <b>Score:</b> The score indicates how negative or positive the
              overall text analyzed is. Anything below a score of -0.05 we tag
              as negative and anything above 0.05 we tag as positive. Anything
              in between inclusively, is tagged as neutral.
            </li>
            <li>
              <b>Ratio:</b> The ratio is the combined total score of negative
              words compared to the combined total score of positive words,
              ranging from -1 to 1.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default About;
