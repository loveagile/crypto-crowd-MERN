import React, { useState, useEffect } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";
import Select from "react-select";
import GetSentimentData from "../api";
import { ScaleLoader } from "react-spinners";
import TagCloud from "react-tag-cloud";
import randomColor from "randomcolor";
import PieChart from "../components/PieChart";

function News() {
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(useLocation().search);
  const coinName = params.get("coin");

  // Array of 3 percentages for positive, negative, neutral
  const [sentDistribution, setSentDistribution] = useState("");

  // Keywords for tag cloud
  const [keywords, setKeywords] = useState([]);

  // Get news data
  const { loading, data, error } = GetSentimentData("news", coinName, 10);

  useEffect(() => {
    if (loading === false) {
      setSentDistribution(getPercentages(data.data.averages.post_types));

      // Get Keywords for all posts
      let words = [];
      for (let i = 0; i < data.data.posts.length; i++) {
        for (
          let j = 0;
          j < data.data.posts[i].sentiment_data.keywords.length;
          j++
        ) {
          words.push(data.data.posts[i].sentiment_data.keywords[j].word);
        }
      }
      setKeywords(words);
    }
  }, [loading]);

  // Get percentages of each sentiment type for pie chart
  function getPercentages(arr) {
    const totalItems = arr.length;
    const uniqueItems = [...new Set(arr)];
    let results = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };
    uniqueItems.forEach((currType) => {
      const numItems = arr.filter((type) => type === currType);

      if (numItems[0] === "positive") {
        results.positive = (numItems.length * 100) / totalItems;
      } else if (numItems[0] === "negative") {
        results.negative = (numItems.length * 100) / totalItems;
      } else if (numItems[0] === "neutral") {
        results.neutral = (numItems.length * 100) / totalItems;
      }
    });
    return results;
  }

  let dropdownOptions = [
    { label: "Reddit", value: "Reddit" },
    { label: "News", value: "News" },
  ];

  return (
    <div className="container my-5">
      {error === null ? (
        <>
          <div className="d-flex justify-content-between align-items-center">
            <h1>
              {coinName}{" "}
              <span className="text-uppercase text-muted">
                ({location.state.data[1]})
              </span>
            </h1>
            <div className="select-container my-3">
              <Select
                options={dropdownOptions}
                defaultValue={dropdownOptions[1]}
                className="sentiment-dropdown"
                onChange={(e) => {
                  history.push({
                    pathname: `/reddit`,
                    search: `?coin=${coinName}`,
                    state: { data: [coinName, location.state.data[1]] },
                  });
                }}
              />
            </div>
          </div>

          <div className="row mt-3 mb-5 d-flex justify-content-between">
            <div className="col-3 border py-3 text-center rounded">
              <p className="fw-bold">Sentiment</p>
              <div className="h-75 d-flex justify-content-center align-items-center">
                {loading === true ? (
                  <ScaleLoader color="#0d6efd" />
                ) : (
                  <PieChart distributionData={sentDistribution} />
                )}
              </div>
            </div>
            <div className="col-3 border py-3 text-center rounded">
              <p className="fw-bold">
                Average Score{" "}
                <Link to="/about">
                  <i className="fas fa-info-circle"></i>
                </Link>
              </p>

              <div className="h-75 d-flex justify-content-center align-items-center">
                {loading === true ? (
                  <ScaleLoader color="#0d6efd" />
                ) : (
                  <h5>{data.data.averages.average_score}</h5>
                )}
              </div>
            </div>
            <div className="col-3 border py-3 text-center rounded data-summary">
              <p className="fw-bold p-0 m-0">Keywords</p>
              {loading === true ? (
                <ScaleLoader color="#0d6efd" />
              ) : (
                <TagCloud
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: 30,
                    fontWeight: "bold",
                    fontStyle: "italic",
                    color: () => randomColor(),
                    padding: 5,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {keywords.map((word, index) => {
                    return (
                      <div
                        style={{
                          fontSize: Math.floor(Math.random() * 25) + 10,
                        }}
                        key={index}
                      >
                        {word}
                      </div>
                    );
                  })}
                </TagCloud>
              )}
            </div>
          </div>

          <div className="post-container">
            <>
              {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center">
                  <ScaleLoader color="#0d6efd" />
                  <h5 className="my-3">Loading News data...</h5>
                </div>
              ) : (
                <div className="news-posts">
                  <h3>
                    <i className="far fa-newspaper"></i> Latest news articles
                    about {coinName}
                  </h3>
                  <p className="my-3 fst-italic">
                    Showing{" "}
                    <span className="px-2 mx-1 bg-primary text-white rounded">
                      {data.data.posts.length}
                    </span>{" "}
                    results:
                  </p>
                  {data.data?.posts.map((article) => (
                    <div
                      className="border rounded my-4 p-3 d-flex"
                      key={article.post_title}
                    >
                      <div>
                        <p className="fw-bold my-2">{article.published}</p>
                        <h5 className="my-2">
                          <a
                            className="text-decoration-none"
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {article.post_title}
                          </a>
                        </h5>

                        {(() => {
                          if (article.sentiment_data.type === "positive") {
                            return (
                              <p className="text-capitalize my-2">
                                <b>Type:</b>{" "}
                                <span className="text-success mx-1">
                                  {article.sentiment_data.type}
                                </span>
                                👍
                              </p>
                            );
                          } else if (
                            article.sentiment_data.type === "negative"
                          ) {
                            return (
                              <p className="text-capitalize my-2">
                                <b>Type:</b>{" "}
                                <span className="text-danger mx-1">
                                  {article.sentiment_data.type}
                                </span>
                                👎
                              </p>
                            );
                          } else if (
                            article.sentiment_data.type === "neutral"
                          ) {
                            return (
                              <p className="text-capitalize my-2">
                                <b>Type:</b>{" "}
                                <span className="text-muted mx-1">
                                  {article.sentiment_data.type}
                                </span>
                                😐
                              </p>
                            );
                          } else {
                            return null;
                          }
                        })()}

                        <p className="text-capitalize my-2">
                          <b>Score:</b> {article.sentiment_data.score}
                        </p>
                        <p className="my-2">
                          <b>Ratio:</b> {article.sentiment_data.ratio}
                        </p>
                        <p className="my-2">
                          <b>Keywords: </b>
                          {article.sentiment_data.keywords.map((obj, index) => (
                            <span
                              className="mx-1 py-2 px-3 rounded bg-light"
                              key={index}
                            >
                              {obj.word}
                            </span>
                          ))}
                        </p>
                      </div>
                      <div className="w-100 d-flex justify-content-end">
                        <img
                          src={article.image}
                          alt=""
                          className="news-image"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          </div>
        </>
      ) : (
        // Redirect to Server error page
        history.push("/503error")
      )}
    </div>
  );
}

export default News;
