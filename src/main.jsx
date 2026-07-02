import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";

// Side-effect import: registers every module (and its policies) exactly once
// before the router builds routes from the registry.
import "./modules";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
