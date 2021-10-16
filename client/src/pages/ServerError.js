import React from "react";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import servererror from "../assets/server-error.svg";

function ServerError() {
  return (
    <div className="container">
      <div className="row align-items-center my-5">
        <div className="col-md-6">
          <h2>Internal Server Error</h2>
          <p className="my-2">There was a problem loading the data</p>
          <Link to="/">
            <Button color="primary" className="my-2">
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="col-md-6">
          <img className="img-fluid" src={servererror} alt="pagenotfound" />
        </div>
      </div>
    </div>
  );
}

export default ServerError;
