import Link from 'next/link';
import { Package, MapPin } from 'lucide-react';

export default function DriverDashboard() {
  const tasks = [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Today's Route</h1>
      
      <div className="space-y-4">
        {tasks.length > 0 ? (
          tasks.map(task => (
            <Link href={`/driver/delivery/${task.id}`} key={task.id} className="block bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 active:bg-[#222] transition-colors">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center">
                   <Package className="w-5 h-5 text-blue-500 mr-2" />
                   <span className="font-bold text-white">Order #{task.id}</span>
                 </div>
                 <span className={`text-xs font-bold px-2 py-1 rounded ${task.status === 'Ready for Pickup' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
                   {task.status}
                 </span>
              </div>
              
              <div className="flex items-start text-gray-400 mt-4">
                 <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                 <div>
                   <p className="text-sm font-medium text-gray-200">{task.address}</p>
                   <p className="text-xs mt-1">{task.customer} • {task.distance} away</p>
                 </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-12 text-center text-gray-500 italic">
            No deliveries assigned to you today.
          </div>
        )}
      </div>
    </div>
  );
}
