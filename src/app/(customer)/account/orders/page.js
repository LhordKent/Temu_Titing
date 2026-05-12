'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { Package, Truck, CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OrderHistory() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ productId: '', orderId: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackOrder, setTrackOrder] = useState(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (productId, orderId) => {
    setReviewData({ productId, orderId, rating: 5, comment: '' });
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          product_id: reviewData.productId,
          user_id: user.id,
          order_id: reviewData.orderId,
          rating: reviewData.rating,
          comment: reviewData.comment
        }]);

      if (error) throw error;
      alert('Review submitted! Thank you.');
      setShowReviewModal(false);
    } catch (err) {
      alert('Error submitting review: ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-500', label: 'Pending' };
      case 'packed':
        return { icon: Package, color: 'text-orange-500', label: 'Packed' };
      case 'shipped':
        return { icon: Truck, color: 'text-blue-500', label: 'In Transit' };
      case 'delivered':
        return { icon: CheckCircle, color: 'text-green-500', label: 'Delivered' };
      case 'cancelled':
        return { icon: AlertCircle, color: 'text-red-500', label: 'Cancelled' };
      default:
        return { icon: Clock, color: 'text-gray-500', label: status };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-temu mb-4" />
        <p className="text-gray-400 font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button onClick={fetchOrders} className="bg-temu text-white px-8 py-3 rounded-full font-bold">Try Again</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-black text-white mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No orders yet</h2>
          <p className="text-gray-400 mb-8">Looks like you haven't placed any orders yet. Start shopping now!</p>
          <Link href="/" className="bg-temu text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition-all">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={order.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                {/* Order Header */}
                <div className="bg-[#222] p-4 flex flex-wrap justify-between items-center border-b border-gray-800 gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Order ID</p>
                    <p className="text-xs font-mono text-gray-300">{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Total Amount</p>
                    <p className="text-lg font-black text-white">₱{parseFloat(order.total_amount).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center bg-[#111] px-4 py-2 rounded-lg border border-gray-700">
                    <StatusIcon className={`w-5 h-5 ${statusConfig.color} mr-2`} />
                    <span className={`font-bold text-sm ${statusConfig.color}`}>{statusConfig.label}</span>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="p-4 divide-y divide-gray-800">
                  {order.order_items.map(item => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-center">
                      <div className="w-20 h-20 bg-white rounded-lg relative flex-shrink-0 overflow-hidden border border-gray-700 cursor-pointer" onClick={() => router.push(`/product/${item.product_id}`)}>
                        {item.product?.images?.[0] ? (
                          <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Link href={`/product/${item.product_id}`} className="text-sm font-bold text-white line-clamp-2 mb-1 hover:text-temu transition-colors">{item.product?.title || 'Product Deleted'}</Link>
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span>Quantity: <span className="text-gray-300 font-bold">{item.quantity}</span></span>
                          <span>Price: <span className="text-gray-300 font-bold">₱{parseFloat(item.price_at_purchase).toLocaleString()}</span></span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p className="font-bold text-white">₱{(item.quantity * item.price_at_purchase).toLocaleString()}</p>
                        {order.status === 'delivered' && (
                          <button 
                            onClick={() => handleReviewClick(item.product_id, order.id)}
                            className="text-[10px] bg-temu/10 text-temu border border-temu/20 px-3 py-1 rounded-full font-bold hover:bg-temu hover:text-white transition-all"
                          >
                            Review Product
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Footer */}
                <div className="p-4 border-t border-gray-800 flex flex-wrap justify-between items-center gap-4 bg-[#111]">
                  <div className="text-xs text-gray-500">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => {
                        setTrackOrder(order);
                        setShowTrackModal(true);
                      }}
                      className="px-6 py-2 text-xs font-bold text-gray-300 border border-gray-700 rounded-full hover:bg-gray-800 transition-colors">
                      Track Package
                    </button>
                    <button 
                      onClick={() => {
                        if (order.status === 'delivered') {
                          handleReviewClick(order.order_items[0]?.product_id, order.id);
                        } else {
                          alert('You can only review delivered orders!');
                        }
                      }}
                      className="px-6 py-2 text-xs font-bold text-temu border border-temu rounded-full hover:bg-temu hover:text-white transition-all"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-white mb-4">Rate this Product</h2>
            <p className="text-gray-400 text-sm mb-6">How was your experience with the item?</p>
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star}
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className={`text-3xl transition-transform active:scale-90 ${reviewData.rating >= star ? 'text-yellow-400' : 'text-gray-700'}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea 
              className="w-full bg-[#111] border border-gray-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-temu placeholder-gray-600 mb-6"
              rows="4"
              placeholder="Tell others what you think (optional)..."
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3 border border-gray-800 text-gray-400 font-bold rounded-full hover:bg-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={submitReview}
                disabled={submittingReview}
                className="flex-1 py-3 bg-temu text-white font-bold rounded-full hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center"
              >
                {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTrackModal && trackOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-gray-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-white mb-6">Track Package</h2>
            
            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:w-0.5 before:bg-gray-800">
              {[
                { status: 'pending', label: 'Order Placed', icon: Clock },
                { status: 'packed', label: 'Packed & Ready', icon: Package },
                { status: 'shipped', label: 'In Transit', icon: Truck },
                { status: 'delivered', label: 'Delivered', icon: CheckCircle }
              ].map((step, index, arr) => {
                const statusOrder = ['pending', 'packed', 'shipped', 'delivered'];
                const currentStatusIndex = statusOrder.indexOf(trackOrder.status);
                const stepIndex = statusOrder.indexOf(step.status);
                
                const isCompleted = stepIndex <= currentStatusIndex;
                const isCurrent = stepIndex === currentStatusIndex;
                const Icon = step.icon;

                return (
                  <div key={step.status} className="relative z-10 flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center absolute -left-6 ${isCompleted ? 'bg-temu' : 'bg-gray-800'} border-4 border-[#1a1a1a] transition-colors`}>
                      <Icon className={`w-3 h-3 ${isCompleted ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className={`font-bold ${isCurrent ? 'text-temu' : isCompleted ? 'text-white' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-gray-400 mt-1">
                          {step.status === 'pending' && 'Waiting for seller to pack your order.'}
                          {step.status === 'packed' && 'Order is packed and waiting for courier.'}
                          {step.status === 'shipped' && 'Courier is on the way to your address.'}
                          {step.status === 'delivered' && 'Package has been delivered successfully!'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => setShowTrackModal(false)}
              className="w-full mt-8 py-3 bg-[#222] border border-gray-800 text-white font-bold rounded-full hover:bg-gray-800 transition-colors"
            >
              Close Tracking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
