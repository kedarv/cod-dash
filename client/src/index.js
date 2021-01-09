import React from 'react';
import ReactDOM from 'react-dom';
import Main from './Main';
import { ChakraProvider } from "@chakra-ui/react"
import { HashRouter } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <ChakraProvider>
        <Main />
      </ChakraProvider>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);