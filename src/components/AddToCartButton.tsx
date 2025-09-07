import React from 'react';
import { useCart } from '../context/CartContext';

interface AddToCartButtonProps {
  productId: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ productId }) => {
  const { addToCart } = useCart();

  const handleAdd = async () => {
    await addToCart(productId, 1);
  };

  return (
    <button
      onClick={handleAdd}
      className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
    >
      Add to Cart
    </button>
  );
};

export default AddToCartButton;
