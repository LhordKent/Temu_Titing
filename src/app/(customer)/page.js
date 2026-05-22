import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { X } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Homepage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q;
  const categorySlug = resolvedSearchParams?.category;

  let dbQuery = supabase
    .from('products')
    .select('*')
    .eq('is_active', true);

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`);
  }

  if (categorySlug) {
    // Get category ID from slug
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', categorySlug)
      .single();

    if (categoryData) {
      dbQuery = dbQuery.eq('category_id', categoryData.id);
    }
  }

  const { data: products, error } = await dbQuery.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
  }

  // Get category name if filtered
  let activeFilterLabel = '';
  if (query) activeFilterLabel = `Results for "${query}"`;
  else if (categorySlug) {
     const { data: cat } = await supabase.from('categories').select('name').eq('slug', categorySlug).single();
     if (cat) activeFilterLabel = `Category: ${cat.name}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Title */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-4 gap-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-black text-white tracking-tight">
            {activeFilterLabel || 'Marketplace'}
          </h1>
          {(query || categorySlug) && (
            <Link 
              href="/" 
              className="flex items-center bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-bold transition-all"
            >
              <X className="w-3 h-3 mr-1" /> Clear
            </Link>
          )}
        </div>
        <div className="flex space-x-2 text-sm text-gray-400 font-medium">
           <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">
             {products?.length || 0} Products Found
           </span>
        </div>
      </div>


      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products && products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-32 text-center">
             <div className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-12 max-w-lg mx-auto">
                <div className="text-4xl mb-4">🔍</div>
                <div className="text-xl font-bold text-white mb-2">No products match your search</div>
                <p className="text-gray-500 mb-8">Try using different keywords or browse all categories.</p>
                <Link href="/" className="bg-temu text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-all">
                  Browse All Products
                </Link>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
