import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";

const Main = () => (
  <main>
    <Routes>
      <Route exact path="/" element={<Home />} />
      <Route path="/game/:id" element={<Home />} />
    </Routes>
  </main>
);

export default Main;
