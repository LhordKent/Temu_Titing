'use client';
import { useState, useEffect, useRef, use } from 'react';
import { Upload, Loader2, X, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

export default function EditProduct({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    image_url: ''
  });

  useEffect(() => {
    if (user && id) {
      fetchProduct();
    }
  }, [user, id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('seller_id', user.id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title,
        description: data.description || '',
        price: data.price.toString(),
        stock: data.stock_quantity.toString(),
        image_url: data.images?.[0] || ''
      });
      setPreview(data.images?.[0] || null);
    } catch (err) {
      console.error('Error fetching product:', err);
      alert('Error fetching product details');
      router.push('/seller/products');
    } finally {
      setLoading(false);
    }
  };

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
      const { error: uploadError } = await supabase.storage
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
      setPreview(formData.image_url);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login first');
    if (!formData.image_url) return alert('Please upload an image first');
    
    setSaving(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          images: [formData.image_url],
          stock_quantity: parseInt(formData.stock) || 0
        })
        .eq('id', id)
        .eq('seller_id', user.id);

      if (error) throw error;
      router.push('/seller/products');
    } catch (err) {
      alert('Error updating product: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-temu animate-spin mb-4" />
        <p className="text-gray-400">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-white">Edit Product</h1>
      
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 shadow-2xl">
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
              <textarea 
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-temu resize-none" 
                placeholder="Tell buyers more about your product..." 
              ></textarea>
            </div>

            {/* Price Row */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Price (₱)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-temu" 
                  placeholder="0.00" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Stock Quantity</label>
                <input 
                  type="number" 
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-temu" 
                  placeholder="e.g. 100" 
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 flex justify-end">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-600 rounded-lg text-white font-medium mr-4 hover:bg-[#222] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving || uploading}
                className="px-6 py-3 bg-temu rounded-lg text-white font-bold hover:bg-orange-600 shadow-lg shadow-orange-900/50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? 'Updating...' : 'Update Product'}
              </button>
            </div>
         </form>
      </div>
    </div>
  );
}
