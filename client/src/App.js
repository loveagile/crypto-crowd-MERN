import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Reddit from "./pages/Reddit";
import News from "./pages/News";
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
        <Route path="/reddit" component={Reddit}></Route>
        <Route path="/news" component={News}></Route>
        <Route path="/503error" component={ServerError}></Route>
        <Route component={PageNotFound}></Route>
      </Switch>
      <Footer />
    </Router>
  );
}

export default App;
