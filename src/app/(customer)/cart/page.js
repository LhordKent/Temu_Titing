'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Loader2, Minus, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function Cart() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product:products (
            id,
            title,
            price,
            images,
            stock_quantity,
            seller_id
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCart();
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 0);
    }
  }, [user, fetchCart]);

  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    const maxStock = item.product?.stock_quantity ?? 0;
    if (newQty > maxStock) {
      alert(`Cannot add more than the actual stock (Only ${maxStock} left).`);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('id', id);
      if (error) throw error;
      setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    } catch (error) {
      alert('Error updating quantity');
    }
  };

  const removeItem = async (id) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setCartItems(cartItems.filter(item => item.id !== id));
    } catch (error) {
      alert('Error removing item');
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  const uniqueSellersCount = new Set(cartItems.map(item => item.product?.seller_id).filter(Boolean)).size;
  const shippingFee = uniqueSellersCount * 80;
  const grandTotal = subtotal + shippingFee;
  const hasInvalidStockItem = cartItems.some(item => item.quantity > (item.product?.stock_quantity ?? 0));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-temu animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-black text-white mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {!user ? (
            <div className="bg-[#1a1a1a] border border-gray-800 p-12 rounded-xl text-center">
              <p className="text-gray-400 text-lg">Please login to view your cart</p>
              <Link href="/login" className="inline-block mt-4 text-temu hover:underline">Sign In</Link>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-gray-800 p-12 rounded-xl text-center">
              <p className="text-gray-400 text-lg">Your cart is empty</p>
              <Link href="/" className="inline-block mt-4 text-temu hover:underline">Continue Shopping</Link>
            </div>
          ) : (
            cartItems.map(item => (
             <div key={item.id} className="bg-[#1a1a1a] border border-gray-800 p-4 rounded-xl flex gap-4">
                <div className="w-24 h-24 bg-white rounded-lg relative overflow-hidden flex-shrink-0">
                  <Image 
                    src={item.product?.images?.[0] || 'https://placehold.co/100x100?text=No+Image'} 
                    alt={item.product?.title || 'Product'} 
                    fill 
                    className="object-contain p-2" 
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-medium line-clamp-2">{item.product?.title}</h3>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-500 hover:text-red-500 ml-4 transition-colors"
                    >
                      <Trash2 className="w-5 h-5"/>
                    </button>
                  </div>
                  {/* Warning if stock exceeded */}
                  {item.quantity > (item.product?.stock_quantity ?? 0) && (
                    <p className="text-red-500 text-xs font-bold mt-1">
                      {item.product?.stock_quantity === 0 
                        ? 'Out of stock. Please remove this item.' 
                        : `Only ${item.product?.stock_quantity} left in stock. Please reduce quantity.`}
                    </p>
                  )}
                  <div className="mt-auto flex justify-between items-end">
                     <div className="text-xl font-bold text-temu">₱{item.product?.price}</div>
                     <div className="flex items-center border border-gray-700 rounded-full overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 bg-[#2a2a2a] text-white hover:bg-gray-700 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-4 text-white text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product?.stock_quantity ?? 0)}
                          className="px-3 py-1 bg-[#2a2a2a] text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                     </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-xl sticky top-24">
             <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
             
             <div className="flex justify-between text-gray-400 mb-4">
               <span>Item(s) total:</span>
               <span>₱{subtotal}</span>
             </div>
             <div className="flex justify-between text-gray-400 mb-4">
               <span>Shipping:</span>
               {shippingFee > 0 ? (
                 <span className="text-white font-bold">₱{shippingFee}</span>
               ) : (
                 <span className="text-green-400 font-bold">FREE</span>
               )}
             </div>
             
             <div className="border-t border-gray-800 my-4"></div>
             
             <div className="flex justify-between items-baseline mb-6">
               <span className="text-lg font-bold text-white">Total:</span>
               <span className="text-3xl font-black text-temu">₱{grandTotal}</span>
             </div>
             
             {hasInvalidStockItem ? (
               <button 
                 disabled 
                 className="w-full bg-[#222] text-gray-500 font-bold py-4 rounded-full text-lg cursor-not-allowed transition-colors opacity-50 border border-gray-800"
               >
                 Checkout
               </button>
             ) : (
               <Link href="/checkout" className="block w-full">
                 <button className="w-full bg-temu hover:bg-orange-600 text-white font-bold py-4 rounded-full text-lg transition-colors shadow-lg shadow-orange-900/50">
                   Checkout
                 </button>
               </Link>
             )}
             
             <div className="mt-4 flex justify-center space-x-2 opacity-50">
               <div className="w-10 h-6 bg-gray-700 rounded border border-gray-600"></div>
               <div className="w-10 h-6 bg-gray-700 rounded border border-gray-600"></div>
               <div className="w-10 h-6 bg-gray-700 rounded border border-gray-600"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
