'use client';
import { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function AddProduct() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    originalPrice: '',
    image_url: ''
  });

  // Redirect if not a seller
  useEffect(() => {
    if (profile && profile.role !== 'seller') {
      router.push('/');
    }
  }, [profile, router]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview immediately
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase 'products' bucket
      const { error: uploadError, data } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (error) {
      alert('Error uploading image: ' + error.message);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login first');
    if (!formData.image_url) return alert('Please upload an image first');
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          title: formData.title,
          price: parseFloat(formData.price),
          discount_price: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          images: [formData.image_url],
          seller_id: user.id,
          stock_quantity: 100
        }]);

      if (error) throw error;
      router.push('/seller/products');
    } catch (err) {
      alert('Error saving product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-white">Add New Product</h1>
      
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
         <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Image Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Product Image</label>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden" 
                accept="image/*"
              />
              
              <div 
                onClick={() => fileInputRef.current.click()}
                className={`relative border-2 border-dashed border-gray-700 rounded-xl min-h-[200px] flex flex-col items-center justify-center hover:border-temu hover:bg-[#222] transition-colors cursor-pointer overflow-hidden ${preview ? 'border-none' : ''}`}
              >
                {preview ? (
                  <div className="relative w-full h-64">
                    <Image src={preview} alt="Preview" fill className="object-contain" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setPreview(null); setFormData({...formData, image_url: ''}) }}
                      className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-temu animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mb-3 text-gray-500" />
                    <span className="text-gray-400 font-medium">Click to upload product image</span>
                    <span className="text-xs text-gray-600 mt-1">PNG, JPG, or WEBP</span>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-temu" 
                placeholder="e.g. Shark Pencil Case" 
              />
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Price (₱)</label>
                <input 
                  type="number" 
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-temu" 
                  placeholder="0.00" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Original Price (₱) - Optional</label>
                <input 
                  type="number" 
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                  className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-temu" 
                  placeholder="0.00" 
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 flex justify-end">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-600 rounded-lg text-white font-medium mr-4 hover:bg-[#222]"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || uploading}
                className="px-6 py-3 bg-temu rounded-lg text-white font-bold hover:bg-orange-600 shadow-lg shadow-orange-900/50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? 'Saving...' : 'Save Product'}
              </button>
            </div>
         </form>
      </div>
    </div>
  );
}
