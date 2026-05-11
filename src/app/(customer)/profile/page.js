'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Loader2, User, Phone, MapPin, Save } from 'lucide-react';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || ''
      });
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Refresh the global profile state so other pages (like Checkout) see the update
      await refreshProfile();
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Please log in to view your profile</h1>
        <a href="/login" className="bg-temu text-white px-8 py-3 rounded-full font-bold">Sign In</a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-white">My Profile</h1>
        <a href="/account/orders" className="text-sm font-bold text-temu border border-temu/30 px-4 py-2 rounded-full hover:bg-temu hover:text-white transition-all flex items-center">
          Order History →
        </a>
      </div>
      
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input 
                type="text" 
                required
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full bg-[#222] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-temu transition-all"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-[#222] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-temu transition-all"
                placeholder="09XX XXX XXXX"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Shipping Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <textarea 
                required
                rows="3"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full bg-[#222] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-temu transition-all"
                placeholder="Enter your complete home address"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-temu hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/40 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
