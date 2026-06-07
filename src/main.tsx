import { Routes } from "@generouted/react-router/lazy";
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { ApiProvider } from "./lib/api/ApiProvider";
import { loadI18n } from "./lib/i18n";

// Remove all Sentry-related code and simplify initialization
async function initializeApp() {
  try {
    await loadI18n();
  } catch (err) {
    console.error("Failed to initialize app:", err);
  } finally {
    initReact();
  }
}

function initReact() {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <ApiProvider>
      <Routes />
    </ApiProvider>,
  );
}

// Start the app
initializeApp();