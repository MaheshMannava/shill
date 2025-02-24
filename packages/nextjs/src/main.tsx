import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Web3Provider } from "./providers/Web3Provider";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode className="bg-[#d4cfcf] bg-[url('https://storage.googleapis.com/tempo-public-images/github%7C71592960-1739296528461-phil_bg_6png')]">
    <Web3Provider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </Web3Provider>
  </React.StrictMode>,
);
