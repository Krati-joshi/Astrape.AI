import React, { useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import { Loader2 } from 'lucide-react';

const Products: React.FC = () => {
  const { state, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  if (state.loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
        <p className="text-gray-600">Browse our collection of high-quality items.</p>
      </div>

      {state.products.length === 0 ? (
        <div className="text-center py-20">
          <h3 className="text-xl font-medium text-gray-900">No products found</h3>
          <p className="text-gray-500">Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;