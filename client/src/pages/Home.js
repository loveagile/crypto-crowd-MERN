import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Jumbotron, Alert } from "reactstrap";
import { ScaleLoader } from "react-spinners";
import heroimg from "../assets/home-header.svg";
import Coin from "../components/Coin";
import { Link } from "react-router-dom";
import Particles from "react-particles-js";

function Home() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    axios
      .get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=aud&order=market_cap_desc&per_page=100&page=1&sparkline=false"
      )
      .then((res) => {
        setCoins(res.data);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredCoins = coins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="particles-container">
        <Particles
          className="bg-light particles-bg"
          params={{
            particles: {
              number: {
                value: 12,
                density: {
                  enable: true,
                  value_area: 800,
                },
              },
              line_linked: {
                enable: false,
              },
              move: {
                speed: 1,
                out_mode: "out",
              },
              shape: {
                type: ["image"],
                image: [
                  {
                    src: "https://assets.stickpng.com/images/5a521fa72f93c7a8d5137fcf.png",
                    height: 19,
                    width: 19,
                  },
                  {
                    src: "https://cryptologos.cc/logos/cardano-ada-logo.png",
                    height: 17,
                    width: 17,
                  },
                  {
                    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/1200px-Ethereum-icon-purple.svg.png",
                    height: 18,
                    width: 18,
                  },
                  {
                    src: "https://cryptologos.cc/logos/chainlink-link-logo.png",
                    height: 15,
                    width: 15,
                  },
                  {
                    src: "https://cryptologos.cc/logos/polkadot-new-dot-logo.png",
                    height: 14,
                    width: 14,
                  },
                  {
                    src: "https://assets.stickpng.com/thumbs/5a521f522f93c7a8d5137fc7.png",
                    height: 12,
                    width: 12,
                  },
                  {
                    src: "https://cryptologos.cc/logos/tether-usdt-logo.png",
                    height: 13,
                    width: 13,
                  },
                  {
                    src: "https://logo.uniswap.org/",
                    height: 15,
                    width: 15,
                  },
                ],
              },
              color: {
                value: "#CCC",
              },
              size: {
                value: 30,
                random: false,
                anim: {
                  enable: true,
                  speed: 4,
                  size_min: 10,
                  sync: false,
                },
              },
            },
            retina_detect: false,
          }}
        />
        <Jumbotron>
          <div className="container">
            <div className="row align-items-center py-5">
              <div className="col-md-6 text-md-left jumbotron-contents">
                <h1 className="jumbotron-heading">
                  Twitter Sentiment Analysis for Cryptocurrencies
                </h1>
                <p className="lead">
                  See what people are tweeting about cryptocurrencies online to
                  optimise your investing.
                </p>
                <Button className="btn-rounded my-2" color="primary">
                  <Link to="about" className="text-white text-decoration-none">
                    Learn More
                  </Link>
                </Button>
              </div>

              <div className="col-md-6">
                <img
                  className="img-fluid"
                  src={heroimg}
                  alt="Cyptocurrency graphic"
                ></img>
              </div>
            </div>
          </div>
        </Jumbotron>
      </div>

      <div className="container custom-box-shadow p-3 my-5">
        <div className="coin-search mb-3 d-flex align-items-center">
          <form className="d-flex justify-content-start">
            <input
              type="text"
              className="p-2 rounded border"
              name="search"
              placeholder="Search.."
              onChange={handleChange}
            />
          </form>

          {(() => {
            if (filteredCoins.length === 0 && loading === false) {
              return (
                <Alert className="my-0 mx-3 p-2" color="danger">
                  No coin matching "{search}"
                </Alert>
              );
            } else {
              return null;
            }
          })()}
        </div>
        {loading === false ? (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Coin</th>
                <th scope="col">Symbol</th>
                <th scope="col">Buy</th>
                <th scope="col">Volume</th>
                <th scope="col">Price Change</th>
                <th scope="col">Market Cap</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCoins.map((coin, index) => {
                let background = "bg-white";
                if (index % 2 === 1) {
                  background = "bg-light";
                }
                return (
                  <Coin
                    key={coin.id}
                    name={coin.name}
                    image={coin.image}
                    symbol={coin.symbol}
                    price={coin.current_price}
                    volume={coin.total_volume}
                    lastUpdated={coin.last_updated}
                    priceChange={coin.price_change_percentage_24h}
                    marketCap={coin.market_cap}
                    background={background}
                  />
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="d-flex justify-content-center">
            <ScaleLoader color="#0d6efd" />
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
