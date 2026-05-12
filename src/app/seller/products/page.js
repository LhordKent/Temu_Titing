import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default async function SellerProducts() {
  // For now, we fetch all products or filter by the mock seller ID
  const { data: sellerProducts, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching seller products:', error);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link href="/seller/products/new" className="bg-temu hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Add Product
        </Link>
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
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
            {sellerProducts && sellerProducts.length > 0 ? (
              sellerProducts.map(product => (
                <tr key={product.id} className="border-b border-gray-800 hover:bg-[#222] transition-colors">
                  <td className="p-4 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded flex-shrink-0 relative">
                       <Image 
                         src={product.images?.[0] || 'https://placehold.co/100x100?text=No+Image'} 
                         alt={product.title} 
                         fill 
                         className="object-contain p-1" 
                       />
                    </div>
                    <span className="font-medium line-clamp-1">{product.title}</span>
                  </td>
                  <td className="p-4 font-bold">₱{product.price}</td>
                  <td className={`p-4 font-medium ${product.stock_quantity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of Stock'}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-3">
                      <button className="text-blue-400 hover:text-blue-300"><Edit className="w-5 h-5" /></button>
                      <button className="text-red-400 hover:text-red-300"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500 italic">No products found. Add your first product to get started!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
