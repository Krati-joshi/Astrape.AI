import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // A helper to format the price in Indian Rupees (₹)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-shadow duration-300 hover:shadow-lg animate-fadeIn">
      {/* Product Image */}
      <div className="aspect-square overflow-hidden">
        <img
          src={product.imageUrl || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="p-4">
        {product.category && (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
            {product.category}
          </span>
        )}
        <h3 className="text-lg font-semibold text-gray-900 truncate mt-2" title={product.name}>
          {product.name}
        </h3>
        <p className="text-xl font-bold text-gray-800 mt-1">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;