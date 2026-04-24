import React, { createContext, useContext } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useScrollStore } from '../store/useScrollStore';

// We keep the provider to initialize the scroll listener
export const ScrollProvider = ({ children }) => {
  useScrollProgress(); // Initializes Lenis and updates the store

  return (
    <>{children}</>
  );
};

// Export the hook that returns the store state
export const useScroll = (selector) => {
  return useScrollStore(selector || (state => state));
};
