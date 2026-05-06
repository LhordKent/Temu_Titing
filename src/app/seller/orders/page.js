import { PackageCheck } from 'lucide-react';

export default function SellerOrders() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Order Fulfillment</h1>
      
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
         <div className="p-4 border-b border-gray-800 flex space-x-4">
           <button className="text-temu font-bold border-b-2 border-temu pb-2 px-2">To Pack (3)</button>
           <button className="text-gray-400 font-medium pb-2 px-2 hover:text-white">To Ship (1)</button>
           <button className="text-gray-400 font-medium pb-2 px-2 hover:text-white">Completed</button>
         </div>
         
         <div className="p-6 text-center py-12 text-gray-500 italic">
           No orders to process yet.
         </div>
      </div>
    </div>
  );
}
