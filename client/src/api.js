import { useState, useEffect } from "react";
import axios from "axios";

export default function GetSentimentData(route, query, limit) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (route === "reddit") {
      getRedditData(query, limit)
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch((e) => {
          setError(e);
          setLoading(false);
        });
    } else if (route === "news") {
      getNewsData(query, limit)
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch((e) => {
          setError(e);
          setLoading(false);
        });
    }
  }, [route]);

  return {
    loading,
    data,
    error,
  };
}

function getRedditData(query, limit) {
  return axios(`/sentiment/reddit/${query}/${limit}`).then(
    (response) => response
  );
}

function getNewsData(query, limit) {
  return axios(`/sentiment/news/${query}/${limit}`).then(
    (response) => response
  );
}
