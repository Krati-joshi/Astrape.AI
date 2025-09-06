import React, { useEffect, useState } from 'react';
import { Plus, Loader2, Search, Filter } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import ProductForm from '../components/ProductForm';
import DeleteConfirmation from '../components/DeleteConfirmation';
import { Product } from '../types';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';

const Products: React.FC = () => {
  const {
    state,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    setCurrentProduct,
  } = useProducts();

  const { state: authState } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  const { addToCart, loading: cartLoading } = useCart();
  const isAdmin = authState.user?.role === 'admin';
 
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  const handleAddProduct = () => {
    if (!isAdmin) {
      toast.error('Only admins can add products');
      return;
    }
    setCurrentProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    if (!isAdmin) {
      toast.error('Only admins can edit products');
      return;
    }
    setCurrentProduct(product);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    if (!isAdmin) {
      toast.error('Only admins can delete products');
      return;
    }
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleFormSubmit = async (productData: Product) => {
    try {
      if (productData._id) {
        await updateProduct(productData._id, productData);
        toast.success('Product updated successfully');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully');
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save product');
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete);
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('You are not authorized to delete this product');
    }
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setMinPrice('');
    setMaxPrice('');
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

  const hasActiveFilters = searchTerm || categoryFilter || minPrice !== '' || maxPrice !== '';

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleAddProduct}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-colors"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Filter size={20} />
              Filters
            </h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden text-gray-500 hover:text-gray-700"
              >
                {showFilters ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden sm:grid'}`}>
           
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 pl-10 pr-4 py-2.5 rounded-lg text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="books">Books</option>
              <option value="home">Home & Garden</option>
              <option value="sports">Sports</option>
              <option value="toys">Toys</option>
            </select>

            <input
              type="number"
              placeholder="Min Price (₹)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : '')}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
              min="0"
            />

            <input
              type="number"
              placeholder="Max Price (₹)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : '')}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
              min="0"
            />
          </div>
        </div>
      </div>

      {state.loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
          {hasActiveFilters ? (
            <>
              <div className="mb-4">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search criteria or filters</p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <Plus size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-500 mb-6">Add your first product to get started</p>
              </div>
              <button
                onClick={handleAddProduct}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <Plus size={18} />
                <span>Add Product</span>
              </button>
            </>
          )}
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
          onCancel={() => {
            setShowForm(false);
            setCurrentProduct(null);
          }}
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
