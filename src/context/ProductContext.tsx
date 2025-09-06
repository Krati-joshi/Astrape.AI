import { createContext, useContext, useReducer, ReactNode } from 'react';
import { ProductState, Product } from '../types';
import * as api from '../services/api';


const initialState: ProductState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null
};

type ProductAction =
  | { type: 'FETCH_PRODUCTS_REQUEST' }
  | { type: 'FETCH_PRODUCTS_SUCCESS'; payload: Product[] }
  | { type: 'FETCH_PRODUCTS_FAILURE'; payload: string }
  | { type: 'SET_CURRENT_PRODUCT'; payload: Product | null }
  | { type: 'CREATE_PRODUCT_SUCCESS'; payload: Product }
  | { type: 'UPDATE_PRODUCT_SUCCESS'; payload: Product }
  | { type: 'DELETE_PRODUCT_SUCCESS'; payload: string }
  | { type: 'CLEAR_ERROR' };

function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    case 'FETCH_PRODUCTS_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_PRODUCTS_SUCCESS':
      return { ...state, products: action.payload, loading: false, error: null };
    case 'FETCH_PRODUCTS_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'SET_CURRENT_PRODUCT':
      return { ...state, currentProduct: action.payload };
    case 'CREATE_PRODUCT_SUCCESS':
      return {
        ...state,
        products: [...state.products, action.payload],
        currentProduct: null,
        loading: false,
        error: null
      };
    case 'UPDATE_PRODUCT_SUCCESS':
      return {
        ...state,
        products: state.products.map(product =>
          product._id === action.payload._id ? action.payload : product
        ),
        currentProduct: null,
        loading: false,
        error: null
      };
    case 'DELETE_PRODUCT_SUCCESS':
      return {
        ...state,
        products: state.products.filter(product => product._id !== action.payload),
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

const ProductContext = createContext<{
  state: ProductState;
  fetchProducts: () => Promise<void>;
  createProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setCurrentProduct: (product: Product | null) => void;
  clearError: () => void;
}>({
  state: initialState,
  fetchProducts: async () => {},
  createProduct: async () => {},
  updateProduct: async () => {},
  deleteProduct: async () => {},
  setCurrentProduct: () => {},
  clearError: () => {}
});


export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  const fetchProducts = async () => {
    dispatch({ type: 'FETCH_PRODUCTS_REQUEST' });
    try {
      const products = await api.getProducts();
      dispatch({ type: 'FETCH_PRODUCTS_SUCCESS', payload: products });
    } catch (error: any) {
      dispatch({
        type: 'FETCH_PRODUCTS_FAILURE',
        payload: error.response?.data?.error || 'Failed to fetch products'
      });
      throw error;
    }
  };

  const createProduct = async (product: Product) => {
    dispatch({ type: 'FETCH_PRODUCTS_REQUEST' });
    try {
      const newProduct = await api.createProduct(product);
      dispatch({ type: 'CREATE_PRODUCT_SUCCESS', payload: newProduct });
    } catch (error: any) {
      dispatch({
        type: 'FETCH_PRODUCTS_FAILURE',
        payload: error.response?.data?.error || 'Failed to create product'
      });
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Product) => {
    dispatch({ type: 'FETCH_PRODUCTS_REQUEST' });
    try {
      const updatedProduct = await api.updateProduct(id, product);
      dispatch({ type: 'UPDATE_PRODUCT_SUCCESS', payload: { ...updatedProduct, _id: id } });
    } catch (error: any) {
      dispatch({
        type: 'FETCH_PRODUCTS_FAILURE',
        payload: error.response?.data?.error || 'Failed to update product'
      });
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    dispatch({ type: 'FETCH_PRODUCTS_REQUEST' });
    try {
      await api.deleteProduct(id);
      dispatch({ type: 'DELETE_PRODUCT_SUCCESS', payload: id });
    } catch (error: any) {
      dispatch({
        type: 'FETCH_PRODUCTS_FAILURE',
        payload: error.response?.data?.error || 'Failed to delete product'
      });
      throw error;
    }
  };

  const setCurrentProduct = (product: Product | null) => {
    dispatch({ type: 'SET_CURRENT_PRODUCT', payload: product });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <ProductContext.Provider
      value={{
        state,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        setCurrentProduct,
        clearError
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};


export const useProducts = () => useContext(ProductContext);

export default ProductContext;
