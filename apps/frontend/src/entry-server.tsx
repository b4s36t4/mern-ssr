import { renderToString } from "react-dom/server";
import React from "react";
import App from "./App";
import "./index.css";

export async function render() {
  const html = renderToString(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  return { html };
}
