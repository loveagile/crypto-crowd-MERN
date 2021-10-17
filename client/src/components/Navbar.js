import React from "react";
import { Link } from "react-router-dom";

import "./Navbar.css";
import logo from "../assets/logo.png";
import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white custom-box-shadow p-0">
      <div className="container nav-inner-container">
        <Link to="/" className="d-flex align-items-center text-decoration-none">
          <h3 class="fw-bold m-0">
            <span class="text-black">Cryto</span>Crowd
          </h3>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ml-auto mb-2 mb-lg-0 nav-links h-100">
            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link px-3 h-100 d-flex align-items-center ${
                  path === "/" ? "bg-primary text-white" : ""
                }`}
              >
                Home
              </Link>
            </li>
            <li class="nav-item">
              <Link
                to="/about"
                className={`nav-link px-3 h-100 d-flex align-items-center ${
                  path === "/about" ? "bg-primary text-white" : ""
                }`}
              >
                About
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
