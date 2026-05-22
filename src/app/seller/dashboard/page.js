'use client';
import { TrendingUp, Package, ShoppingCart, Loader2, ChevronRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function SellerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    activeOrders: 0,
    productsCount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [authLoading, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Active Products Count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('is_active', true);

      // 2. Fetch Active Orders (Pending, Packed, Shipped)
      const { count: activeOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .in('status', ['pending', 'packed', 'shipped'])
        .eq('hidden_by_seller', false);

      // 3. Fetch Completed Orders for Total Sales
      const { data: completedOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('seller_id', user.id)
        .eq('status', 'delivered');

      const totalSales = completedOrders?.reduce((acc, order) => acc + parseFloat(order.total_amount), 0) || 0;

      // 4. Fetch 5 Recent Orders
      const { data: recent } = await supabase
        .from('orders')
        .select(`
          *,
          customer:profiles!orders_customer_id_fkey (full_name)
        `)
        .eq('seller_id', user.id)
        .eq('hidden_by_seller', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalSales,
        activeOrders: activeOrdersCount || 0,
        productsCount: productsCount || 0
      });
      setRecentOrders(recent || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Sales', value: `₱${stats.totalSales.toLocaleString()}`, icon: TrendingUp, color: 'text-green-500' },
    { title: 'Active Orders', value: stats.activeOrders.toString(), icon: ShoppingCart, color: 'text-blue-500' },
    { title: 'Products', value: stats.productsCount.toString(), icon: Package, color: 'text-orange-500' },
  ];

  if (authLoading || (loading && recentOrders.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-temu animate-spin mb-4" />
        <p className="text-gray-400">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-xl flex items-center justify-between shadow-lg">
            <div>
              <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
              <h3 className="text-3xl font-bold">{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-full bg-[#222] ${stat.color} border border-white/5`}>
              <stat.icon className="w-8 h-8" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <Link href="/seller/orders" className="text-temu text-sm font-bold hover:underline">View All</Link>
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {recentOrders.map(order => (
              <div key={order.id} className="p-4 hover:bg-[#222] transition-colors flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{order.customer?.full_name || 'Anonymous Customer'}</p>
                    <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{order.status}</p>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-4">
                  <div>
                    <p className="font-bold text-white">₱{parseFloat(order.total_amount).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-temu transition-colors" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 italic">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-10" />
            No recent orders found.
          </div>
        )}
      </div>
    </div>
  );
}
