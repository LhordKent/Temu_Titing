import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg border border-gray-800 group hover:shadow-2xl hover:border-gray-600 transition-all duration-300 flex flex-col h-full cursor-pointer relative">
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
        <Link href={`/product/${product.id}`} className="block">
           <h3 className="text-sm text-gray-200 line-clamp-2 font-medium mb-2 group-hover:text-temu transition-colors">
             {product.title}
           </h3>
        </Link>
        
        <div className="mt-auto">
          {/* Price Row */}
          <div className="flex items-baseline mb-1">
            <span className="text-lg font-extrabold text-white mr-2">₱{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-500 line-through">₱{product.originalPrice}</span>
            )}
          </div>
          
          
          {/* Add to Cart Button */}
          <button className="w-full py-2 rounded-full border border-gray-600 text-white font-semibold flex items-center justify-center group-hover:bg-temu group-hover:border-temu group-hover:text-white transition-all duration-300">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
