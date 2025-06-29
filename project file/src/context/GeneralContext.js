import React, { createContext, useState } from 'react';

export const GeneralContext = createContext();

export const GeneralContextProvider = ({ children }) => {
  const [state, setState] = useState({});
  const [username, setUsername] = useState('');
  return (
    <GeneralContext.Provider value={{ state, setState, username, setUsername }}>
      {children}
    </GeneralContext.Provider>
  );
};