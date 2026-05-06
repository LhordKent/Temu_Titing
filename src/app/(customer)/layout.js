import TopBanner from '@/components/TopBanner';
import Navbar from '@/components/Navbar';

export default function CustomerLayout({ children }) {
  return (
    <>
      <TopBanner />
      <Navbar />
      <main className="flex-grow">{children}</main>
      
      {/* Footer Placeholder */}
      <footer className="bg-black py-12 border-t border-gray-800 text-center mt-12">
        <p className="text-gray-500 text-sm">© 2026 Temu Clone. All rights reserved.</p>
      </footer>
    </>
  );
}
