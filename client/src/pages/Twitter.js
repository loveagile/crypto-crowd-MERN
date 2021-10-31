import React, { useState, useEffect } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";
import GetSentimentData from "../api";
import { ScaleLoader } from "react-spinners";
import TagCloud from "react-tag-cloud";
import randomColor from "randomcolor";
import PieChart from "../components/PieChart";
import Moment from 'react-moment';
import ReactPaginate from "react-paginate";


function Twitter() {
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(useLocation().search);
  const coinName = params.get("coin");

  // Get Twitter data
  const { loading, data, error } = GetSentimentData("twitter", coinName);
  
  // Pagination
  const [pageNumber, setPageNumber] = useState(0);  

  const postsPerPage = 20;

  const pagesVisited = pageNumber * postsPerPage;

  const [pageCount, setPageCount] = useState(0);
  
  // set page count when loading is false
  useEffect(() => {
    if (!loading) {
      setPageCount(Math.ceil(data.data?.posts.length / postsPerPage));
    }
  }, [loading, data]);

  const changePage = ({selected}) => {
    setPageNumber(selected);
  };  

  const displayPosts = data.data?.posts.slice(pagesVisited, pagesVisited + postsPerPage).map((post, index) => {
    return (
      <div
      className="border rounded my-4 p-3 d-flex"
      key={index}
      >
      <div className="d-flex align-items-center flex-column justify-content-center twitter-img-container">
        <img
          src={post.user_profile_img}
          alt="twitter profile"
          className="twitter-image"
        />
        <p className="fw-bold text-center mt-2">{post.user}</p>
      </div>
      <div class="twitter-info-container">
        <h5 className="my-2">
          <a
            className={`text-decoration-none ${!post.tweet_url ? "text-black link-disabled" : ""}`}
            href={post.tweet_url ? post.tweet_url : "#"}
            target="_blank"
            rel="noreferrer"
          >
            {post.tweet_text}
          </a>
        </h5>

        <p className="text-capitalize my-2">
          <b>Posted:</b>{" "}
          <span className="mx-1">
             <Moment fromNow>
                { new Date(Date.parse(post.created_at.replace(/( \+)/, ' UTC$1')))}
            </Moment>
          </span>
        </p>

        {(() => {
          if (post.sentiment_data.score > 0) {
            return (
              <p className="text-capitalize my-2">
                <b>Type:</b>{" "}
                <span className="text-success mx-1">
                  Positive
                </span>
                😊
              </p>
            );
          } else if (post.sentiment_data.score < 0) {
            return (
              <p className="text-capitalize my-2">
                <b>Type:</b>{" "}
                <span className="text-danger mx-1">
                  Negative
                </span>
                ☹️
              </p>
            );
          } else {
            return (
              <p className="text-capitalize my-2">
                <b>Type:</b>{" "}
                <span className="text-muted mx-1">
                  Neutral
                </span>
                😐
              </p>
            );
          }
        })()}

        <p className="text-capitalize my-2">
          <b>Score:</b> {post.sentiment_data.score}
        </p>
        <p className="my-2">
          <b>Comparative Score:</b>{" "}
          {post.sentiment_data.comparative}
        </p>
        {post.sentiment_data.words.length > 0 ? (
          <p className="my-2">
            <b>Keywords: </b>
            {post.sentiment_data.words.map((word, index) => (
              <span
                className="mx-1 py-2 px-3 rounded bg-light"
                key={index}
              >
                {word}
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </div>
    );
  })


  if (!loading) {
    data.data?.posts.sort((a, b) => new Date(Date.parse(a.created_at.replace(/( \+)/, ' UTC$1'))) < new Date(Date.parse(b.created_at.replace(/( \+)/, ' UTC$1'))) ? 1 : -1);
  }

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
          </div>

          <div className="row mt-3 mb-5 d-flex justify-content-between">
            <div className="col-3 border py-3 text-center rounded">
              <p className="fw-bold">Sentiment</p>
              <div className="h-75 d-flex justify-content-center align-items-center">
                {loading === true ? (
                  <ScaleLoader color="#0d6efd" />
                ) : (
                  <PieChart distributionData={data.data?.averages.all_scores} />
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
                  <h3 className="text-muted">{data.data?.averages.average_score.toFixed(3)}</h3>
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
                    fontWeight: "bold",
                    fontStyle: "italic",
                    color: () => randomColor(),
                    padding: 5,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {data.data?.averages.keywords.map((word, index) => {
                    return (
                      <div
                        style={{
                          fontSize: Math.floor(Math.random() * 20) + 5,
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
                  <h5 className="my-3">Loading Twitter data...</h5>
                </div>
              ) : (
                <div className="reddit-posts">
                  <div className="d-flex justify-content-between">
                    <h3>
                      <i className="fab fa-twitter text-primary"></i>
                      <span class="mx-2">
                        Top Twitter posts about {coinName}
                      </span>
                    </h3>
                  </div>
                
                  <div className="d-flex justify-content-between">

                    <p className="my-3 fst-italic">
                      Showing {postsPerPage} of {" "}
                      <span className="px-2 mx-1 bg-primary text-white rounded">
                        {data.data.posts.length}
                      </span>{" "}
                      results:
                    </p>

                    <p className="d-flex align-items-center justify-content-center fst-italic">Page: {pageNumber + 1}</p>
                  </div>
                  

                  {displayPosts}
                  <ReactPaginate 
                  previousLabel="Previous"
                  nextLabel="Next" 
                  pageCount={pageCount} 
                  onPageChange={changePage}
                  containerClassName="paginate-btns" 
                  previousLinkClassName="previous-btn"
                  nextLinkClassName="next-btn"
                  disabledClassName="paginate-disabled"
                  activeClassName="paginate-active" />
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

export default Twitter;
