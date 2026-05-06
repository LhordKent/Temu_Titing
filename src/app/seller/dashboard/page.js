import { TrendingUp, Package, ShoppingCart } from 'lucide-react';

export default function SellerDashboard() {
  const stats = [
    { title: 'Total Sales', value: '₱45,231', icon: TrendingUp, color: 'text-green-500' },
    { title: 'Active Orders', value: '12', icon: ShoppingCart, color: 'text-blue-500' },
    { title: 'Products', value: '48', icon: Package, color: 'text-orange-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold">{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-full bg-[#222] ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        <div className="space-y-4">
           {[1,2,3].map(i => (
             <div key={i} className="flex justify-between items-center py-3 border-b border-gray-800 last:border-0">
               <div>
                 <p className="font-medium">Order #ORD-7{i}8{i}9</p>
                 <p className="text-sm text-gray-500">2 items • ₱350.00</p>
               </div>
               <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-full">Pending Fulfillment</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
