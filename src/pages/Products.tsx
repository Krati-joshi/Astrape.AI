import React, { useEffect, useState, useRef } from 'react';
import { Plus, Loader2, Search, Filter, X } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import ProductForm from '../components/ProductForm';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { Product } from '../types';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

const Products: React.FC = () => {
  const { state, fetchProducts, createProduct, updateProduct, deleteProduct, setCurrentProduct } = useProducts();
  const { state: authState } = useAuth();
  const { addToCart } = useCart();

  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  const [tempCategory, setTempCategory] = useState('');
  const [tempMinPrice, setTempMinPrice] = useState<number | ''>('');
  const [tempMaxPrice, setTempMaxPrice] = useState<number | ''>('');

  const isAdmin = authState.user?.role === 'admin';

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToCart = async (productId: string) => await addToCart(productId, 1);

  const handleAddProduct = () => {
    if (!isAdmin) return toast.error('Only admins can add products');
    setCurrentProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    if (!isAdmin) return toast.error('Only admins can edit products');
    setCurrentProduct(product);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    if (!isAdmin) return toast.error('Only admins can delete products');
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleFormSubmit = async (productData: Product) => {
    try {
      productData._id
        ? await updateProduct(productData._id, productData)
        : await createProduct(productData);
      toast.success('Product saved successfully');
      setShowForm(false);
    } catch {
      toast.error('Failed to save product');
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete);
      toast.success('Product deleted successfully');
    } catch {
      toast.error('Not authorized');
    }
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const cancelDelete = () => { setShowDeleteConfirm(false); setProductToDelete(null); };

  const clearFilters = () => {
    setCategoryFilter(''); setMinPrice(''); setMaxPrice('');
    setTempCategory(''); setTempMinPrice(''); setTempMaxPrice('');
  };

  const applyFilters = () => {
    setCategoryFilter(tempCategory);
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setShowFilters(false);
  };

  const filteredProducts = state.products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter
      ? product.category?.toLowerCase() === categoryFilter.toLowerCase()
      : true;
    const matchesMinPrice = minPrice !== '' ? product.price >= minPrice : true;
    const matchesMaxPrice = maxPrice !== '' ? product.price <= maxPrice : true;
    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border ${
                showFilters || categoryFilter || minPrice !== '' || maxPrice !== ''
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter
                size={18}
                className={`${showFilters || categoryFilter || minPrice !== '' || maxPrice !== '' ? 'text-white' : 'text-gray-700'}`}
              />
              <span>Filters</span>
            </button>

            {showFilters && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-50 animate-slideDown">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                  <select
                    value={tempCategory}
                    onChange={e => setTempCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">All Categories</option>
                    <option value="electronics">Electronics</option>
                    <option value="fashion">Fashion</option>
                    <option value="books">Books</option>
                    <option value="home">Home & Garden</option>
                    <option value="sports">Sports</option>
                    <option value="toys">Toys</option>
                    <option value="clothing">Clothing</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Price (₹)</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input
                        type="text"
                        placeholder="0"
                        value={tempMinPrice}
                        onChange={e => { const val = e.target.value.replace(/[^\d]/g, ''); setTempMinPrice(val ? parseInt(val) : ''); }}
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input
                        type="text"
                        placeholder="1000"
                        value={tempMaxPrice}
                        onChange={e => { const val = e.target.value.replace(/[^\d]/g, ''); setTempMaxPrice(val ? parseInt(val) : ''); }}
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={applyFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={clearFilters}
                    className="text-gray-700 hover:text-gray-900 font-medium underline px-4 py-2"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="mt-2 sm:mt-0">
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              <Plus size={18} /> Add Product
            </button>
          </div>
        )}
      </div>

      {(categoryFilter || minPrice !== '' || maxPrice !== '') && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {categoryFilter && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{categoryFilter}</span>
          )}
          {(minPrice !== '' || maxPrice !== '') && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{`₹${minPrice || 0} - ₹${maxPrice || '∞'}`}</span>
          )}
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white font-medium px-3 py-1 rounded-full text-sm transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {state.loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 size={40} className="animate-spin text-blue-600" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteClick}
              onAddToCart={handleAddToCart}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      
      {showForm && (
        <ProductForm
          product={state.currentProduct}
          onSubmit={handleFormSubmit}
          onCancel={() => { setShowForm(false); setCurrentProduct(null); }}
        />
      )}
      {showDeleteConfirm && (
        <DeleteConfirmation
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          itemName="Product"
        />
      )}
    </div>
  );
};

export default Products;
