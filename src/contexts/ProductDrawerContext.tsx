import { createContext, useContext } from 'react';

interface ProductDrawerContextType {
  openProductDrawer: (product?: any) => void;
}

export const ProductDrawerContext = createContext<ProductDrawerContextType>({
  openProductDrawer: () => {},
});

export const useProductDrawer = () => useContext(ProductDrawerContext); 