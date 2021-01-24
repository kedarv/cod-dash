import React from "react";
import { Switch, Route } from "react-router-dom";
import Home from "./components/Home";
import PlayerDetail from "./components/PlayerDetail";

const Main = () => (
  <main>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/game/:id" component={Home} />
      <Route path="/player/:name" component={PlayerDetail} />
    </Switch>
  </main>
);

export default Main;