import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Package, LayoutDashboard, ShoppingCart, LogOut, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { state, logout } = useAuth();
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
    setShowDropdown(false);
  };

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserInitial = () => {
    if (state.user?.name) {
      return state.user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Astrape.AI</h1>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                isActive('/') 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link
              to="/products"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                isActive('/products') 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Package size={18} />
              Products
            </Link>
            <Link
              to="/cart"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium relative ${
                isActive('/cart') 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart size={18} />
              Cart
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </Link>
          </nav>

          <nav className="md:hidden flex items-center gap-2">
            <Link
              to="/"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard size={20} />
            </Link>
            <Link
              to="/products"
              className={`p-2 rounded-lg transition-colors ${
                isActive('/products') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Package size={20} />
            </Link>
            <Link
              to="/cart"
              className={`p-2 rounded-lg transition-colors relative ${
                isActive('/cart') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </Link>
          </nav>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-medium text-sm">
                {getUserInitial()}
              </div>
              
              <div className="hidden sm:flex items-center gap-1">
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-24">
                    {state.user?.name?.split(' ')[0] || 'User'}
                  </div>
                  {state.user?.role === 'admin' && (
                    <div className="text-xs text-indigo-600 font-medium">Admin</div>
                  )}
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </div>
              
              <ChevronDown size={16} className={`sm:hidden text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">{state.user?.name}</div>
                  <div className="text-xs text-gray-500">{state.user?.email}</div>
                  {state.user?.role === 'admin' && (
                    <div className="text-xs text-indigo-600 font-medium mt-1">Administrator</div>
                  )}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;