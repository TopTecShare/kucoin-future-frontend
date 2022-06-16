import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Histories from "./containers/History";
import Navbar from "./components/Navbar";
import "./styles/App.css";

const App = () => {
  return (
    <div className="container mt-3">
      <Router>
        <Navbar />
        <Route path="/" exact component={Histories} />
      </Router>
    </div>
  );
};

export default App;
