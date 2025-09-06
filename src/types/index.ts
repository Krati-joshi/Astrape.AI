export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
  bio?: string;
  profileImage?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category:string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
}