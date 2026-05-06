import { products, sellers } from '@/lib/mockData';
import Image from 'next/image';
import { ShoppingCart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetails({ params }) {
  const { id } = params;
  const product = products.find(p => p.id === id) || products[0];
  const seller = sellers.find(s => s.id === product.sellerId) || sellers[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left: Image */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-800">
            {product.image && (
               <Image 
                 src={product.image} 
                 alt={product.title} 
                 fill 
                 className="object-contain"
               />
            )}
          </div>
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-2xl font-bold text-white mb-4 leading-tight">{product.title}</h1>
          
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 mb-6">
             <div className="flex items-baseline mb-2">
               <span className="text-4xl font-black text-white mr-3">₱{product.price}</span>
               <span className="text-lg text-gray-500 line-through mr-3">₱{product.originalPrice}</span>
               <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold">{product.discount}</span>
             </div>
             <div className="text-sm text-gray-400">
               Stock: <span className="text-green-400 font-bold">In Stock</span>
             </div>
          </div>

          <div className="space-y-4 mb-8">
             <div className="flex items-center text-sm font-medium text-gray-300">
               <Truck className="w-5 h-5 mr-3 text-green-400" /> Free Shipping
             </div>
             <div className="flex items-center text-sm font-medium text-gray-300">
               <ShieldCheck className="w-5 h-5 mr-3 text-blue-400" /> Delivery Guarantee
             </div>
             <div className="flex items-center text-sm font-medium text-gray-300">
               <RotateCcw className="w-5 h-5 mr-3 text-orange-400" /> 90-day Free Returns
             </div>
          </div>

          <div className="mt-auto space-y-3">
             <button className="w-full bg-temu hover:bg-orange-600 text-white font-bold py-4 rounded-full text-lg shadow-lg shadow-orange-900/50 transition-transform active:scale-95 flex items-center justify-center">
               <ShoppingCart className="w-6 h-6 mr-2" /> Add to Cart
             </button>
             <button className="w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded-full text-lg transition-transform active:scale-95">
               Buy Now
             </button>
          </div>
          
          {/* Seller Info */}
          <div className="mt-8 p-4 border border-gray-800 rounded-xl flex items-center justify-between bg-[#1a1a1a]">
             <div>
               <div className="text-white font-bold mb-1">{seller.name}</div>
             </div>
             <Link href={`/seller/${seller.id}`} className="text-temu font-bold text-sm px-4 py-2 border border-temu rounded-full">View Store</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
