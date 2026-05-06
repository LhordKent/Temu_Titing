import { orders, products } from '@/lib/mockData';
import Image from 'next/image';
import { Package, Truck, CheckCircle } from 'lucide-react';

export default function OrderHistory() {
  const getProduct = (id) => products.find(p => p.id === id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-black text-white mb-8">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map(order => (
          <div key={order.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
             {/* Order Header */}
             <div className="bg-[#222] p-4 flex justify-between items-center border-b border-gray-800">
               <div>
                 <p className="text-xs text-gray-500 mb-1">Order ID: {order.id}</p>
                 <p className="text-sm font-bold text-white">Total: ₱{order.total}</p>
               </div>
               <div className="flex items-center">
                 {order.status === 'Ready for Pickup' && <Package className="w-5 h-5 text-orange-500 mr-2" />}
                 {order.status === 'In Transit' && <Truck className="w-5 h-5 text-blue-500 mr-2" />}
                 {order.status === 'Delivered' && <CheckCircle className="w-5 h-5 text-green-500 mr-2" />}
                 <span className="font-bold text-white">{order.status}</span>
               </div>
             </div>
             
             {/* Order Items */}
             <div className="p-4 space-y-4">
               {order.items.map(item => {
                 const product = getProduct(item.productId);
                 return (
                   <div key={item.productId} className="flex gap-4 items-center">
                     <div className="w-16 h-16 bg-white rounded-lg relative flex-shrink-0">
                       {product?.image && <Image src={product.image} alt="product" fill className="object-contain" />}
                     </div>
                     <div className="flex-1">
                       <p className="text-sm text-gray-300 line-clamp-1">{product?.title}</p>
                       <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                     </div>
                     <div className="font-bold text-white">₱{item.price}</div>
                   </div>
                 );
               })}
             </div>
             
             {/* Order Footer */}
             <div className="p-4 border-t border-gray-800 flex justify-end space-x-3 bg-[#111]">
               <button className="px-4 py-2 text-sm font-semibold text-white border border-gray-600 rounded-full hover:bg-gray-800">Track Package</button>
               <button className="px-4 py-2 text-sm font-semibold text-temu border border-temu rounded-full hover:bg-temu hover:text-white">Buy Again</button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
