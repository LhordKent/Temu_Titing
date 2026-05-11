'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [email, setEmail] = useState('');

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setMessage('Password reset link sent! Please check your email inbox.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2 tracking-tight">
            <span className="text-white">Te</span>
            <span className="text-temu">mu</span>
          </h1>
          <p className="text-gray-400 text-sm">Reset your password</p>
        </div>

        {message ? (
          <div className="text-center">
            <div className="bg-green-900/30 border border-green-500 text-green-200 text-sm p-4 rounded-lg mb-6">
              {message}
            </div>
            <Link 
              href="/login" 
              className="inline-flex items-center text-temu font-bold hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-4">
            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-200 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#222] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-temu transition-colors"
                  placeholder="name@example.com"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                We'll send a recovery link to this email address if it's associated with an account.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-temu hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-900/40 transition-all flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
