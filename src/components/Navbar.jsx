'use client';
import { Search, ShoppingCart, User, List, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="bg-[#1a1a1a] text-white border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              <span className="text-white">Te</span>
              <span className="text-temu">mu</span>
            </Link>
          </div>

          {/* Categories Dropdown */}
          <div className="hidden lg:flex items-center ml-4 cursor-pointer hover:text-temu transition-colors group relative">
            <List className="w-5 h-5 mr-1" />
            <span className="font-medium">Categories</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl px-4 ml-4 hidden md:flex">
            <div className="relative w-full flex">
              <input
                type="text"
                className="w-full bg-white text-black rounded-l-full py-2 px-6 focus:outline-none focus:ring-2 focus:ring-temu placeholder-gray-500 font-medium"
                placeholder="Search products, sellers, or categories..."
              />
              <button className="bg-temu text-white px-6 rounded-r-full font-bold hover:bg-orange-600 transition-colors absolute right-0 top-0 bottom-0 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right Links */}
          <div className="flex items-center space-x-6 ml-4">
            
            {/* User Account */}
            {user ? (
              <div className="hidden lg:flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400">Hello, {profile?.full_name || user.email}</span>
                  <span className="text-[10px] font-bold text-temu uppercase">{profile?.role}</span>
                </div>
                <button 
                  onClick={signOut}
                  className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden lg:flex flex-col items-center cursor-pointer hover:text-temu transition-colors group">
                <User className="w-6 h-6 mb-1" />
                <div className="text-[10px] leading-tight text-center">
                  Sign in / Register<br/><span className="font-bold">Orders & Account</span>
                </div>
              </Link>
            )}


            {/* Seller/Driver Links */}
            <div className="hidden md:flex space-x-4 ml-2">
               {(!profile || profile.role === 'seller') && (
                 <Link href="/seller/dashboard" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors border border-gray-600 px-2 py-1 rounded">Seller Center</Link>
               )}
               {(!profile || profile.role === 'driver') && (
                 <Link href="/driver/dashboard" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors border border-gray-600 px-2 py-1 rounded">Logistics</Link>
               )}
            </div>

            {/* Cart */}
            <Link href="/cart" className="flex items-center cursor-pointer hover:text-temu transition-colors relative">
              <ShoppingCart className="w-8 h-8" />
              <span className="absolute -top-1 -right-2 bg-temu text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#1a1a1a]">
                3
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
