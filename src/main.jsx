
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import "./index.css";

import ThemeProvider from "./context/ThemeContext";
import BugProvider from "./context/BugContext";
import AuthProvider from "./context/AuthContext";
import NotificationProvider from "./context/NotificationContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    >
      <ThemeProvider>
        <AuthProvider>
          <BugProvider>
            <NotificationProvider>
              <App />

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: "var(--toast-bg, #0f172a)",
                    color: "var(--toast-color, #f8fafc)",
                    border:
                      "1px solid var(--toast-border, rgba(51, 65, 85, 0.8))",
                    borderRadius: "0.75rem",
                    boxShadow:
                      "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
                    fontSize: "0.875rem",
                    padding: "12px 16px",
                  },
                  success: {
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#0f172a",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#0f172a",
                    },
                  },
                }}
              />
            </NotificationProvider>
          </BugProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
