import { useState, useEffect } from "react";
import axios from "axios";

export default function GetSentimentData(route, query, limit) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (route === "twitter") {
      getRedditData(query, limit)
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
  return axios(`http://127.0.0.1:3001/sentiment/twitter/${query}`).then(
    (response) => response
  );
}
