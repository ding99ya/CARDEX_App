import React, { createContext, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationStack, setNavigationStack] = useState([]);

  const navigateTo = (path) => {
    setNavigationStack((prevStack) => [...prevStack, location.pathname]);
    // history.push(path);
    navigate(path);
  };

  const goBack = () => {
    setNavigationStack((prevStack) => {
      const newStack = [...prevStack];
      const lastPage = newStack.pop();
      setNavigationStack(newStack);
      if (lastPage) {
        // history.push(lastPage);
        navigate(lastPage);
      }
      return newStack;
    });
  };

  const resetNavigation = () => {
    setNavigationStack([]);
  };

  return (
    <NavigationContext.Provider value={{ navigateTo, goBack, resetNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);
