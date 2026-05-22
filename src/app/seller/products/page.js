'use client';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit, Trash2, Loader2, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function SellerProducts() {
  const { user, profile, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchProducts();
    }
  }, [authLoading, user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching seller products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(id);
    try {
      // Use soft delete (setting is_active to false) instead of hard delete
      // to preserve order history and avoid foreign key constraint errors
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || (loading && products.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-temu animate-spin mb-4" />
        <p className="text-gray-400">Loading your products...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link href="/seller/products/new" className="bg-temu hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
          <Plus className="w-5 h-5 mr-2" /> Add Product
        </Link>
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#222] border-b border-gray-800">
              <th className="p-4 font-semibold text-gray-400">Product</th>
              <th className="p-4 font-semibold text-gray-400">Price</th>
              <th className="p-4 font-semibold text-gray-400">Stock</th>
              <th className="p-4 font-semibold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map(product => (
                <tr key={product.id} className="border-b border-gray-800 hover:bg-[#222] transition-colors group">
                  <td className="p-4 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#222] group-hover:bg-[#333] rounded-lg flex-shrink-0 relative border border-gray-800 overflow-hidden">
                       <Image 
                         src={product.images?.[0] || 'https://placehold.co/100x100?text=No+Image'} 
                         alt={product.title} 
                         fill 
                         className="object-contain p-1" 
                       />
                    </div>
                    <span className="font-medium line-clamp-1">{product.title}</span>
                  </td>
                  <td className="p-4 font-bold text-white">₱{product.price.toLocaleString()}</td>
                  <td className={`p-4 font-medium ${product.stock_quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of Stock'}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/seller/products/edit/${product.id}`}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id, product.title)}
                        disabled={deletingId === product.id}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-50"
                      >
                        {deletingId === product.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-12 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="italic">No products found. Add your first product to get started!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
