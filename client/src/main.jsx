import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "./styles/global/variables.css";
import "./styles/global/global.css";
import "./styles/global/utilities.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);