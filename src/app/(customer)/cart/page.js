import { products } from '@/lib/mockData';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

export default function Cart() {
  const cartItems = products.length > 0 ? [
    { ...products[0], quantity: 1 },
    { ...products[1], quantity: 2 }
  ] : [];
  
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-black text-white mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {cartItems.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-gray-800 p-12 rounded-xl text-center">
              <p className="text-gray-400 text-lg">Your cart is empty</p>
              <Link href="/" className="inline-block mt-4 text-temu hover:underline">Continue Shopping</Link>
            </div>
          ) : (
            cartItems.map(item => (
             <div key={item.id} className="bg-[#1a1a1a] border border-gray-800 p-4 rounded-xl flex gap-4">
                <div className="w-24 h-24 bg-white rounded-lg relative overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.title} fill className="object-contain" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-medium line-clamp-2">{item.title}</h3>
                    <button className="text-gray-500 hover:text-red-500 ml-4"><Trash2 className="w-5 h-5"/></button>
                  </div>
                  <div className="mt-auto flex justify-between items-end">
                     <div className="text-xl font-bold text-temu">₱{item.price}</div>
                     <div className="flex items-center border border-gray-700 rounded-full overflow-hidden">
                       <button className="px-3 py-1 bg-[#2a2a2a] text-white hover:bg-gray-700">-</button>
                       <span className="px-4 text-white text-sm font-medium">{item.quantity}</span>
                       <button className="px-3 py-1 bg-[#2a2a2a] text-white hover:bg-gray-700">+</button>
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
               <span className="text-green-400 font-bold">FREE</span>
             </div>
             
             <div className="border-t border-gray-800 my-4"></div>
             
             <div className="flex justify-between items-baseline mb-6">
               <span className="text-lg font-bold text-white">Total:</span>
               <span className="text-3xl font-black text-temu">₱{subtotal}</span>
             </div>
             
             <button className="w-full bg-temu hover:bg-orange-600 text-white font-bold py-4 rounded-full text-lg transition-colors shadow-lg shadow-orange-900/50">
               Checkout
             </button>
             
             <div className="mt-4 flex justify-center space-x-2 opacity-50">
               {/* Mock Payment Icons */}
               <div className="w-10 h-6 bg-gray-300 rounded"></div>
               <div className="w-10 h-6 bg-gray-300 rounded"></div>
               <div className="w-10 h-6 bg-gray-300 rounded"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
