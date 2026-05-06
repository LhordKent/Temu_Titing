import { MapPin, Phone, User, CheckCircle, Navigation } from 'lucide-react';
import Link from 'next/link';

export default function DeliveryView({ params }) {
  const { orderId } = params;

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <Link href="/driver/dashboard" className="text-blue-500 mr-4">← Back</Link>
        <h1 className="text-xl font-bold">Delivery #{orderId}</h1>
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden mb-6">
         {/* Mock Map Area */}
         <div className="h-48 bg-[#222] flex flex-col items-center justify-center relative border-b border-gray-800">
            <div className="w-full h-full opacity-30 bg-[url('https://maps.gstatic.com/mapfiles/api-3/images/cb_scout5.png')] bg-cover"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
               <MapPin className="w-8 h-8 mb-2" />
               <span>Map View</span>
            </div>
         </div>
         
         <div className="p-4 space-y-4">
            <div className="flex items-start">
               <User className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
               <div>
                 <p className="font-bold text-white">Jane Doe</p>
                 <p className="text-sm text-gray-400">Customer</p>
               </div>
               <button className="ml-auto p-2 bg-green-500/20 text-green-500 rounded-full">
                 <Phone className="w-5 h-5" />
               </button>
            </div>
            
            <div className="flex items-start">
               <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
               <div>
                 <p className="font-bold text-white">456 Elm St, Cebu City</p>
                 <p className="text-sm text-gray-400">Gate code: 1234</p>
               </div>
               <button className="ml-auto p-2 bg-blue-500/20 text-blue-500 rounded-full">
                 <Navigation className="w-5 h-5" />
               </button>
            </div>
         </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
         <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex justify-center items-center active:bg-blue-700 transition-colors">
            Update Status to &quot;Arrived&quot;
         </button>
         <button className="w-full bg-green-600 text-white font-bold py-4 rounded-xl flex justify-center items-center active:bg-green-700 transition-colors">
            <CheckCircle className="w-6 h-6 mr-2" /> Mark as Delivered
         </button>
      </div>
    </div>
  );
}
