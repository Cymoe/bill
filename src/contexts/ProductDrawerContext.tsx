import { createContext, useContext } from 'react';

export const ProductDrawerContext = createContext<{ openProductDrawer: () => void }>({
  openProductDrawer: () => {},
});

export const useProductDrawer = () => useContext(ProductDrawerContext); 