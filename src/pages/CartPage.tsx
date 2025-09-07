import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

const CartPage: React.FC = () => {
  const {
    cart,
    loading,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  } = useCart();

  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (quantity < 0) return;

    setLoadingIds((prev) => [...prev, productId]);
    try {
      await updateCartItem(productId, quantity);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleRemove = async (productId: string) => {
    setLoadingIds((prev) => [...prev, productId]);
    try {
      await removeFromCart(productId);
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const handleClearCart = async () => {
    setShowClearConfirm(true);
  };

  const confirmClearCart = async () => {
    await clearCart();
    setShowClearConfirm(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading && cart.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart.length) {
    return (
      <div className="text-center py-20">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some products to get started</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {getCartItemsCount()} {getCartItemsCount() === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-800 font-medium transition-colors"
              disabled={loading}
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cart Items</h3>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      <img
                        src={
                          item.product?.imageUrl ||
                          'https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg'
                        }
                        alt={item.product?.name || 'Product'}
                        className="w-full h-32 sm:w-16 sm:h-16 object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {item.product?.name || 'Product'}
                      </h4>
                      <p className="text-sm text-gray-500 capitalize">
                        {item.product?.category || 'Category'}
                      </p>
                      <p className="text-lg font-semibold text-indigo-600 mt-1">
                        {formatPrice(item.product?.price || 0)}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                      <div className="flex items-center gap-2 order-2 sm:order-1">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.productId, item.quantity - 1)
                          }
                          disabled={
                            loadingIds.includes(item.productId) || item.quantity <= 1
                          }
                          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-medium text-lg">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.productId, item.quantity + 1)
                          }
                          disabled={loadingIds.includes(item.productId)}
                          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                     
                      <div className="flex items-center justify-between w-full sm:w-auto gap-4 order-1 sm:order-2">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatPrice((item.product?.price || 0) * item.quantity)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemove(item.productId)}
                          disabled={loadingIds.includes(item.productId)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Items ({getCartItemsCount()})
                  </span>
                  <span className="font-medium">{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
                onClick={() => toast.success('Checkout functionality coming soon!')}
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </button>

            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <ArrowLeft size={18} />
          Continue Shopping
        </Link>
      </div>

      <ConfirmationModal
        isOpen={showClearConfirm}
        onConfirm={confirmClearCart}
        onCancel={() => setShowClearConfirm(false)}
        title="Clear Cart"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmText="Clear Cart"
        cancelText="Keep Items"
        type="danger"
      />
    </div>
  );
};

export default CartPage;
