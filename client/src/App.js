import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Twitter from "./pages/Twitter";
import Footer from "./components/Footer";
import "./App.css";
import ServerError from "./pages/ServerError";
import PageNotFound from "./pages/PageNotFound";

function App() {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route path="/" exact component={Home}></Route>
        <Route path="/about" component={About}></Route>
        <Route path="/twitter" component={Twitter}></Route>
        <Route path="/503error" component={ServerError}></Route>
        <Route component={PageNotFound}></Route>
      </Switch>
      <Footer />
    </Router>
  );
}

export default App;
