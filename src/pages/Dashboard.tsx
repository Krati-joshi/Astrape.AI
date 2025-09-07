import React, { useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, Package, } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { state: productState, fetchProducts } = useProducts();
  const { state: authState } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
  };

  const totalValue = productState.products.reduce((sum, p) => sum + p.price, 0);
  const averagePrice =
    productState.products.length > 0 ? totalValue / productState.products.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="animate-fadeIn px-4 md:px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 lg:mb-3">
            Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-medium">
            Welcome {authState.user?.name ? `, ${authState.user.name}` : ''} 👋
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 lg:mb-16">
          <div className="group bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 lg:p-8 hover:-translate-y-1">
            <h3 className="text-sm text-gray-600 font-medium uppercase tracking-wider mb-4 lg:mb-6">Total Products</h3>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">{productState.products.length}</p>
            <Link to="/products" className="inline-flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
              Manage Products
              <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="group bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 lg:p-8 hover:-translate-y-1">
            <h3 className="text-sm text-gray-600 font-medium uppercase tracking-wider mb-4 lg:mb-6">Inventory Value</h3>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{formatCurrency(totalValue)}</p>
            <p className="text-sm text-emerald-600 font-medium">Based on current stock</p>
          </div>

          <div className="group bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 lg:p-8 hover:-translate-y-1 sm:col-span-2 xl:col-span-1">
            <h3 className="text-sm text-gray-600 font-medium uppercase tracking-wider mb-4 lg:mb-6">Average Price</h3>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{formatCurrency(averagePrice)}</p>
            <p className="text-sm text-orange-500 font-medium">Per product</p>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl lg:rounded-3xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 lg:mb-8 gap-4">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Recent Products</h2>
              <Link to="/products" className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors text-sm sm:text-base">
                View All
                <ArrowUpRight size={16} className="ml-2" />
              </Link>
            </div>
            
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 lg:py-4 px-4 lg:px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="py-3 lg:py-4 px-4 lg:px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                      <th className="py-3 lg:py-4 px-4 lg:px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productState.loading ? (
                      <tr>
                        <td colSpan={3} className="py-8 lg:py-12 px-4 lg:px-6 text-center">
                          <div className="flex justify-center items-center space-x-2">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <span className="ml-3 text-gray-500">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : productState.products.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 lg:py-12 px-4 lg:px-6 text-center text-gray-500">
                         <Package className="mx-auto mb-4 text-gray-300 w-8 h-8 lg:w-12 lg:h-12" />
                          <p className="text-base lg:text-lg font-medium">No products found</p>
                          <p className="text-sm">Add your first product to get started</p>
                        </td>
                      </tr>
                    ) : (
                      productState.products.slice(0, 5).map((product) => (
                        <tr
                          key={product._id}
                          className="hover:bg-indigo-50/50 transition-colors"
                        >
                          <td className="py-4 lg:py-5 px-4 lg:px-6">
                            <div className="font-semibold text-gray-900 text-sm lg:text-base">{product.name}</div>
                          </td>
                          <td className="py-4 lg:py-5 px-4 lg:px-6">
                            <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium bg-indigo-100 text-indigo-800">
                              {formatCurrency(product.price)}
                            </span>
                          </td>
                          <td className="py-4 lg:py-5 px-4 lg:px-6 hidden md:table-cell">
                            <p className="text-gray-600 max-w-xs truncate text-sm lg:text-base">{product.description}</p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;