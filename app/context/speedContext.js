import React, { createContext, useState, useContext } from "react";

const SpeedContext = createContext();

export const SpeedProvider = ({ children }) => {
  const [currentSpeed, setCurrentSpeed] = useState(1);
  return (
    <SpeedContext.Provider value={{ currentSpeed, setCurrentSpeed }}>
      {children}
    </SpeedContext.Provider>
  );
};

export const useSpeed = () => useContext(SpeedContext);
