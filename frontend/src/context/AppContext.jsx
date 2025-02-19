import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "₹";
  const backendUrl = "http://localhost:5250";
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize token from localStorage
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Listen for storage changes (e.g., in case token is updated in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("token");
      console.log("Storage changed, new token:", newToken);
      setToken(newToken);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Login and logout helper functions.
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // Decode the token and update userId whenever the token changes.
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        console.log("Decoded token:", decodedToken);
        // Check token expiration (if exp is in seconds, multiply by 1000 to compare with Date.now())
        if (decodedToken.exp * 1000 < Date.now()) {
          console.error("Token expired");
          localStorage.removeItem("token");
          setUserId(null);
        } else {
          setUserId(decodedToken.userSpecificId);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      setUserId(null);
    }
    setLoading(false);
  }, [token]); // This effect now re-runs whenever 'token' changes

  return (
    <AppContext.Provider value={{ currencySymbol, backendUrl, userId, loading, login, logout }}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
