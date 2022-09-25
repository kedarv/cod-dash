import React from 'react';
import ReactDOM from 'react-dom/client';

import Main from "./Main";
import { ChakraProvider } from "@chakra-ui/react";
import { HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ChakraProvider>
        <Main />
      </ChakraProvider>
    </HashRouter>
  </React.StrictMode>
);
