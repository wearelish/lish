import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 2. BUG: Non-null assertion on root element can throw if element is missing
// Add a safe fallback
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found in the DOM. Check your index.html.");
}
createRoot(rootElement).render(<App />);
