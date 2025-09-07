import React, { useState, useRef, useEffect } from 'react';
import { Edit, Trash2, ShoppingCart, MoreVertical } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAddToCart: (productId: string) => void;
  isAdmin?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onAddToCart,
  isAdmin = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all duration-200 animate-fadeIn flex flex-col h-full">
      <div className="relative w-full bg-gray-50 flex justify-center items-center overflow-hidden">
        <img
          src={product.imageUrl || 'https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg'}
          alt={product.name}
          className="w-full h-48 sm:h-56 object-contain transition-transform duration-300 group-hover:scale-105"
        />
        {product.category && (
          <div className="absolute top-2 left-2">
            <span className="bg-white/80 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full capitalize">
              {product.category}
            </span>
          </div>
        )}
        {isAdmin && (
          <div className="absolute top-2 right-2" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors shadow-sm"
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    onEdit(product);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(product._id || '');
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="text-md font-semibold text-gray-900 mb-1 line-clamp-1" title={product.name}>
          {product.name}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2 leading-snug mb-3 flex-grow" title={product.description}>
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          <button
            onClick={() => onAddToCart(product._id || '')}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-2 rounded-lg transition-colors shadow-sm min-w-[80px] justify-center"
          >
            <ShoppingCart size={14} />
            <span className="text-sm">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
