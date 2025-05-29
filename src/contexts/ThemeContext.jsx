// src/contexts/ThemeContext.jsx
import React, { createContext, useContext } from 'react';

const themeColors = {
  primary: "#7B2CBF",
  primaryLight: "#9D4EDD",
  primaryDark: "#5A189A",
  background: "#FFFFFF",
  backgroundLight: "#F9F7FD",
  backgroundDark: "#F6F1FB",
  text: "#333333",
  textLight: "#555555",
  textMuted: "#777777",
  borderColor: "#E6E1F9",
  success: "#10B981",
  info: "#3B82F6",
  warning: "#F59E0B",
  danger: "#EF4444",
  statusPending: "#F59E0B",
  statusProcessing: "#3B82F6",
  statusShipped: "#7B2CBF",
  statusDelivered: "#10B981",
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const theme = {
    ...themeColors,
    gradient: "linear-gradient(120deg, #9D4EDD 0%, #5A189A 100%)",
    shadow: "0 10px 25px rgba(123, 44, 191, 0.08)",
    shadowHover: "0 15px 30px rgba(123, 44, 191, 0.12)",
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);