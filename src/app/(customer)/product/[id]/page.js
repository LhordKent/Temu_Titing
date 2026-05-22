'use client';
import { useState, useEffect, use, useCallback } from 'react';
import Image from 'next/image';
import { ShoppingCart, ShieldCheck, Truck, RotateCcw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProductDetails({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [reviews, setReviews] = useState([]);

  const fetchProduct = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles!seller_id (
            id,
            full_name
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles (full_name)
      `)
      .eq('product_id', id)
      .order('created_at', { ascending: false });

    if (!error) setReviews(data || []);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProduct();
    fetchReviews();
  }, [id, fetchProduct, fetchReviews]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setAdding(true);
    try {
      // 1. Fetch real-time latest stock quantity
      const { data: latestProduct, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', product.id)
        .single();

      if (productError || !latestProduct) {
        throw new Error('Failed to verify latest stock.');
      }

      const stockQuantity = latestProduct.stock_quantity;

      // 2. Fetch existing cart item quantity
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .single();

      const existingQty = existingItem ? existingItem.quantity : 0;

      if (existingQty + 1 > stockQuantity) {
        alert(`Cannot add more. You already have ${existingQty} in your cart, and only ${stockQuantity} are left in stock.`);
        return;
      }

      if (existingItem) {
        await supabase
          .from('cart_items')
          .update({ quantity: existingQty + 1 })
          .eq('id', existingItem.id);
      } else {
        await supabase
          .from('cart_items')
          .insert([{ user_id: user.id, product_id: product.id, quantity: 1 }]);
      }
      alert('Added to cart!');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-temu" /></div>;
  if (!product) return <div className="text-center py-20 text-white">Product not found</div>;

  const isOwner = user?.id === product.seller_id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-16">
        
        {/* Left: Image */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-800 p-4 shadow-2xl">
            <Image 
              src={product.images?.[0] || 'https://placehold.co/500x500?text=No+Image'} 
              alt={product.title} 
              fill 
              className="object-contain p-8"
            />
          </div>
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-3xl font-black text-white mb-4 leading-tight">{product.title}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-yellow-400">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className="text-lg">{averageRating >= star ? '★' : '☆'}</span>
              ))}
            </div>
            <span className="text-gray-400 font-bold text-sm">{averageRating ? `${averageRating} / 5.0` : 'No reviews'}</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400 font-medium text-sm">{reviews.length} reviews</span>
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 mb-6 shadow-xl">
             <div className="flex items-baseline mb-2">
               <span className="text-4xl font-black text-white mr-3">₱{parseFloat(product.price).toLocaleString()}</span>
               {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
                 <span className="text-orange-500 text-sm font-bold ml-4">Only {product.stock_quantity} left!</span>
               )}
             </div>
             <div className="text-sm text-gray-400">
               Stock Status: <span className={product.stock_quantity > 0 ? 'text-green-400 font-bold' : 'text-red-500 font-bold'}>
                 {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
               </span>
             </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Description</h3>
              <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}


          <div className="mt-auto space-y-3">
             {isOwner ? (
               <div className="w-full bg-[#1a1a1a] border border-gray-800 text-gray-500 font-bold py-4 rounded-full text-center">
                 You are the seller of this product
               </div>
             ) : (
               <>
                 <button 
                  onClick={handleAddToCart}
                  disabled={adding || product.stock_quantity === 0}
                  className="w-full bg-temu hover:bg-orange-600 text-white font-bold py-4 rounded-full text-lg shadow-lg shadow-orange-900/50 transition-transform active:scale-95 flex items-center justify-center disabled:opacity-50"
                 >
                   {adding ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <ShoppingCart className="w-6 h-6 mr-2" />}
                   {adding ? 'Adding...' : 'Add to Cart'}
                 </button>
                 <button 
                  onClick={() => {
                    handleAddToCart().then(() => router.push('/checkout'));
                  }}
                  disabled={adding || product.stock_quantity === 0}
                  className="w-full bg-white hover:bg-gray-200 text-black font-bold py-4 rounded-full text-lg transition-transform active:scale-95 disabled:opacity-50"
                 >
                   Buy Now
                 </button>
               </>
             )}
          </div>
          
          {/* Seller Info */}
          <div className="mt-8 p-4 border border-gray-800 rounded-xl flex items-center justify-between bg-[#1a1a1a]">
             <div className="flex items-center">
                <div className="w-10 h-10 bg-temu rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {product.seller?.full_name?.[0] || 'S'}
                </div>
                <div>
                  <div className="text-gray-400 text-xs font-bold uppercase tracking-tighter">Seller</div>
                  <div className="text-white font-bold">{product.seller?.full_name || 'Verified Seller'}</div>
                </div>
             </div>
             <Link href={`/seller/${product.seller_id}`} className="text-temu font-bold text-sm px-4 py-2 border border-temu rounded-full hover:bg-temu hover:text-white transition-all">View Store</Link>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t border-gray-800 pt-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Customer Reviews</h2>
            <p className="text-gray-500 font-medium">Ratings and feedback from verified buyers.</p>
          </div>
          <div className="text-right">
             <div className="text-4xl font-black text-white">{averageRating || '0.0'}</div>
             <div className="flex text-yellow-400">
               {[1, 2, 3, 4, 5].map(star => (
                 <span key={star} className="text-xl">{averageRating >= star ? '★' : '☆'}</span>
               ))}
             </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-[#1a1a1a] rounded-3xl p-12 text-center border border-gray-800 border-dashed">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-gray-500 italic">Be the first to review this product!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-[#1a1a1a] border border-gray-800 rounded-3xl p-6 shadow-xl hover:border-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-black mr-3 border border-gray-700">
                      {review.user?.full_name?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{review.user?.full_name || 'Anonymous User'}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 text-sm">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star}>{review.rating >= star ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-[#111] p-4 rounded-xl border border-gray-800/50">
                  <p className="text-gray-300 text-sm leading-relaxed">{review.comment || 'This buyer didn\'t leave a comment, but gave it a rating.'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
