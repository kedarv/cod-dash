import React from "react";
import { Switch, Route } from "react-router-dom";
import Home from "./components/Home";

const Main = () => (
  <main>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/game/:id" component={Home} />
    </Switch>
  </main>
);

export default Main;