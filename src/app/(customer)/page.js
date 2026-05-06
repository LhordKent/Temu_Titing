import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export default async function Homepage() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Title */}
      <div className="mb-8 flex justify-between items-center border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-black text-white tracking-tight">Marketplace</h1>
        <div className="flex space-x-2 text-sm text-gray-400">
           <span>{products?.length || 0} Products Found</span>
        </div>
      </div>


      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products && products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-500">
             <div className="text-xl font-bold mb-2">No products available yet</div>
             <p>Check back soon or start selling in the Seller Center!</p>
          </div>
        )}
      </div>
    </div>
  );
}
