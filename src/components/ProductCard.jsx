'use client';
import Image from 'next/image';
import { ShoppingCart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent navigation to product page if button is clicked
    
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // Upsert cart item (increment if exists, insert if not)
      // Note: In Supabase, we can use ON CONFLICT or just check first.
      // Since our schema has UNIQUE(user_id, product_id), we can use upsert.
      
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert([{ user_id: user.id, product_id: product.id, quantity: 1 }]);
        if (error) throw error;
      }

      alert('Added to cart!');
      // Optional: Refresh cart count in header if we had a state for it
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={() => router.push(`/product/${product.id}`)}
      className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg border border-gray-800 group hover:shadow-2xl hover:border-gray-600 transition-all duration-300 flex flex-col h-full cursor-pointer relative"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-white overflow-hidden flex items-center justify-center p-4">
        {product.images && product.images.length > 0 ? (
          <Image 
            src={product.images[0]} 
            alt={product.title} 
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : product.image ? (
          <Image 
            src={product.image} 
            alt={product.title} 
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
           <div className="text-gray-400">No Image</div>
        )}
        
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
         <h3 className="text-sm text-gray-200 line-clamp-2 font-medium mb-2 group-hover:text-temu transition-colors">
           {product.title}
         </h3>
        
        <div className="mt-auto">
          {/* Price Row */}
          <div className="flex items-baseline mb-1">
            <span className="text-lg font-extrabold text-white mr-2">₱{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-500 line-through">₱{product.originalPrice}</span>
            )}
          </div>
          
          
          {/* Add to Cart Button */}
          {user?.id === product.seller_id ? (
            <div className="w-full py-2 rounded-full border border-gray-800 text-gray-600 font-semibold flex items-center justify-center text-xs bg-[#222]">
              You own this product
            </div>
          ) : (
            <button 
              onClick={handleAddToCart}
              disabled={loading}
              className="w-full py-2 rounded-full border border-gray-600 text-white font-semibold flex items-center justify-center group-hover:bg-temu group-hover:border-temu group-hover:text-white transition-all duration-300 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
              {loading ? 'Adding...' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
