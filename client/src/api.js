import { useState, useEffect } from "react";
import axios from "axios";

export default function GetSentimentData(route, query) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (route === "twitter") {
      getTwitterData(query)
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

function getTwitterData(query) {
  return axios(`http://${window.location.hostname}:3001/sentiment/twitter/${query}`).then(
    (response) => response
  );
}
