import { Truck, ShieldCheck, Download } from 'lucide-react';

export default function TopBanner() {
  return (
    <div className="bg-black text-white text-xs py-2 px-4 flex justify-between items-center hidden md:flex border-b border-gray-800">
      <div className="flex items-center space-x-4">
        <span className="font-bold tracking-tight">
          <span className="text-white">Te</span>
          <span className="text-temu">mu</span>
        </span>
      </div>
    </div>
  );
}
