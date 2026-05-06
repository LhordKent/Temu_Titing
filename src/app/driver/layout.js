import Link from 'next/link';
import { Navigation, Map, ClipboardList, LogOut } from 'lucide-react';

export default function DriverLayout({ children }) {
  return (
    <div className="flex flex-col h-screen bg-[#000] text-white">
      {/* Driver Header */}
      <header className="h-16 bg-[#111] border-b border-gray-800 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center">
          <Navigation className="w-6 h-6 text-blue-500 mr-2" />
          <span className="font-bold text-lg">Temu Logistics</span>
        </div>
        <div className="flex items-center space-x-2">
           <div className="w-2 h-2 rounded-full bg-green-500"></div>
           <span className="text-sm font-medium text-green-500">Online</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Driver Bottom Nav (Mobile/Web Hybrid feel) */}
      <nav className="fixed bottom-0 w-full h-16 bg-[#111] border-t border-gray-800 flex justify-around items-center">
         <Link href="/driver/dashboard" className="flex flex-col items-center text-blue-500">
           <ClipboardList className="w-6 h-6" />
           <span className="text-[10px] mt-1 font-bold">Tasks</span>
         </Link>
         <div className="flex flex-col items-center text-gray-500 hover:text-white transition-colors cursor-not-allowed">
           <Map className="w-6 h-6" />
           <span className="text-[10px] mt-1 font-medium">Map</span>
         </div>
         <Link href="/" className="flex flex-col items-center text-gray-500 hover:text-white transition-colors">
           <LogOut className="w-6 h-6" />
           <span className="text-[10px] mt-1 font-medium">Exit</span>
         </Link>
      </nav>
    </div>
  );
}
