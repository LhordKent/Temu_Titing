'use client';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Store, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SellerLayout({ children }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!profile || profile.role !== 'seller')) {
      router.push('/');
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
      <div className="h-screen bg-[#111] flex items-center justify-center text-white">
        <Loader2 className="w-12 h-12 text-temu animate-spin" />
      </div>
    );
  }

  if (!profile || profile.role !== 'seller') {
    return null; // Will redirect via useEffect
  }

  const displayName = profile?.full_name || 'Seller';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-[#111] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center border-b border-gray-800">
          <Store className="w-8 h-8 text-temu mr-2" />
          <span className="text-xl font-bold">Seller Center</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/seller/dashboard" className="flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </Link>
          <Link href="/seller/products" className="flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <Package className="w-5 h-5 mr-3" /> Products
          </Link>
          <Link href="/seller/orders" className="flex items-center p-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
            <ShoppingCart className="w-5 h-5 mr-3" /> Orders
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="flex items-center p-3 text-gray-400 hover:text-white transition-colors">
            <LogOut className="w-5 h-5 mr-3" /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#1a1a1a] border-b border-gray-800 flex items-center justify-between px-6">
           <div className="md:hidden font-bold text-temu">Seller Center</div>
           <div className="flex items-center justify-end w-full">
             <div className="flex items-center space-x-3">
               <div className="w-8 h-8 bg-temu rounded-full flex items-center justify-center font-bold">{initial}</div>
               <span className="font-medium text-sm hidden sm:block">{displayName}</span>
             </div>
           </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
