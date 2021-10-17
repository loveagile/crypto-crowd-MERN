import React from "react";
import { useHistory } from "react-router-dom";
import "./Coin.css";

const Coin = ({
  name,
  image,
  symbol,
  price,
  volume,
  priceChange,
  marketCap,
  background,
}) => {
  const history = useHistory();

  return (
    <tr className={`${background} border-bottom`}>
      <td>
        <div className="d-flex align-items-center">
          <img className="coin-icon" src={image} alt="crypto" />
          <p>{name}</p>
        </div>
      </td>

      <td className="text-uppercase">{symbol}</td>
      <td>${price.toLocaleString()}</td>
      <td>${volume.toLocaleString()}</td>
      <td>
        {priceChange < 0 ? (
          <div className="d-flex">
            <p className="fw-bold px-2 py-1 bg-dark-red text-light-red rounded">
              {priceChange.toFixed(2)}%
            </p>
          </div>
        ) : (
          <div className="d-flex">
            <p className="fw-bold px-2 py-1 bg-dark-green text-light-green rounded">
              {priceChange.toFixed(2)}%
            </p>
          </div>
        )}
      </td>
      <td>${marketCap.toLocaleString()}</td>
      <td>
        <button
          className="btn btn-primary"
          onClick={(row) =>
            history.push({
              pathname: `/twitter`,
              search: `?coin=${name}`,
              state: { data: [name, symbol] },
            })
          }
        >
          Sentiment
        </button>
      </td>
    </tr>
  );
};

export default Coin;
