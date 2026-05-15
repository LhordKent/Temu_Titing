'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { Package, Truck, CheckCircle, Loader2, Search, Filter, ChevronRight, User, MapPin, Phone, Trash2, RotateCcw } from 'lucide-react';

export default function SellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, packed, shipped, completed
  const [updatingId, setUpdatingId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, showArchived]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:profiles!orders_customer_id_fkey (full_name, email, phone, address),
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('seller_id', user.id)
        .eq('hidden_by_seller', showArchived)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching seller orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleArchive = async (orderId, shouldHide) => {
    if (shouldHide && !window.confirm('Hide this order from your dashboard? This won\'t delete the order from the database, but it will clear it from your view.')) return;
    
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ hidden_by_seller: shouldHide })
        .eq('id', orderId);

      if (error) throw error;
      
      // Update local state by removing it from the current list (active or archived)
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (err) {
      alert(`Error ${shouldHide ? 'hiding' : 'restoring'} order: ` + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'pending') return order.status === 'pending';
    if (activeTab === 'packed') return order.status === 'packed';
    if (activeTab === 'shipped') return order.status === 'shipped';
    if (activeTab === 'completed') return order.status === 'delivered';
    return true;
  });

  const tabs = [
    { id: 'pending', label: 'To Pack', count: orders.filter(o => o.status === 'pending').length },
    { id: 'packed', label: 'To Ship', count: orders.filter(o => o.status === 'packed').length },
    { id: 'shipped', label: 'In Transit', count: orders.filter(o => o.status === 'shipped').length },
    { id: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'delivered').length },
  ];

  if (loading && orders.length === 0) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-10 h-10 animate-spin text-temu" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-white">
          {showArchived ? 'Archived Orders' : 'Order Fulfillment'}
        </h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => {
              setShowArchived(!showArchived);
              setOrders([]); // Clear local state to trigger full loading feel
            }}
            className={`text-xs font-bold px-4 py-2 rounded-full border transition-all flex items-center ${
              showArchived 
                ? 'bg-temu/10 border-temu text-temu hover:bg-temu/20' 
                : 'bg-[#1a1a1a] border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
            }`}
          >
            {showArchived ? (
              <>Back to Active Orders</>
            ) : (
              <><Filter className="w-3 h-3 mr-2" /> View Archived</>
            )}
          </button>
          <div className="text-sm text-gray-400 font-medium">
            Total {showArchived ? 'Archived' : 'Active'}: <span className="text-white">{orders.length}</span>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden mb-6 shadow-xl">
        <div className="flex border-b border-gray-800 bg-[#222]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 text-sm font-bold transition-all relative ${
                activeTab === tab.id ? 'text-temu' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-center">
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-temu text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-temu" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-temu" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-800 mx-auto mb-4" />
              <p className="text-gray-500 italic">No {showArchived ? 'archived' : ''} orders found in this category.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-[#222] border border-gray-700 rounded-xl overflow-hidden shadow-lg group">
                  {/* Order Header */}
                  <div className="p-4 bg-[#282828] border-b border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-temu/10 rounded-full flex items-center justify-center text-temu border border-temu/20">
                         <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{order.customer?.full_name || 'Anonymous Customer'}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{order.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-1">{new Date(order.created_at).toLocaleString()}</p>
                      <div className="flex items-center justify-end">
                        <span className="text-lg font-black text-white mr-2">₱{parseFloat(order.total_amount).toLocaleString()}</span>
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-temu transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-x divide-gray-700">
                    {/* Items List */}
                    <div className="lg:col-span-2 p-4 space-y-4 bg-[#1e1e1e]">
                      {order.order_items.map(item => (
                        <div key={item.id} className="flex gap-4 items-center">
                          <div className="w-14 h-14 bg-white rounded-lg relative flex-shrink-0 overflow-hidden border border-gray-800">
                            {item.product?.images?.[0] ? (
                              <Image src={item.product.images[0]} alt="product" fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">{item.product?.title}</p>
                            <p className="text-xs text-gray-500 font-bold">Qty: {item.quantity} × ₱{parseFloat(item.price_at_purchase).toLocaleString()}</p>
                          </div>
                          <div className="text-sm font-bold text-white">
                            ₱{(item.quantity * item.price_at_purchase).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Info & Actions */}
                    <div className="p-4 bg-[#252525] space-y-4">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-black mb-2 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" /> Shipping Details
                        </h4>
                        <div className="text-xs text-gray-400 space-y-1">
                          <p className="text-white font-bold">{order.shipping_address?.full_name}</p>
                          <p className="flex items-center"><Phone className="w-3 h-3 mr-1" /> {order.shipping_address?.phone}</p>
                          <p className="line-clamp-2">{order.shipping_address?.address}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-700">
                        {showArchived ? (
                          <button 
                            onClick={() => toggleArchive(order.id, false)}
                            disabled={updatingId === order.id}
                            className="w-full bg-white hover:bg-gray-200 text-black font-bold py-2.5 rounded-lg text-xs flex items-center justify-center transition-all disabled:opacity-50"
                          >
                            {updatingId === order.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                            Restore to Active
                          </button>
                        ) : (
                          <>
                            {order.status === 'pending' && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'packed')}
                                disabled={updatingId === order.id}
                                className="w-full bg-temu hover:bg-orange-600 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-orange-900/20"
                              >
                                {updatingId === order.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Package className="w-4 h-4 mr-2" />}
                                Mark as Packed
                              </button>
                            )}
                            {order.status === 'packed' && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                disabled={updatingId === order.id}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center transition-all disabled:opacity-50"
                              >
                                {updatingId === order.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Truck className="w-4 h-4 mr-2" />}
                                Mark as Shipped
                              </button>
                            )}
                            {order.status === 'shipped' && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                disabled={updatingId === order.id}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center transition-all disabled:opacity-50"
                              >
                                {updatingId === order.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                Confirm Delivery
                              </button>
                            )}
                            {order.status === 'delivered' && (
                              <div className="space-y-2">
                                <div className="w-full bg-gray-800 text-gray-500 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center border border-gray-700">
                                  <CheckCircle className="w-4 h-4 mr-2" /> Order Completed
                                </div>
                                <button 
                                  onClick={() => toggleArchive(order.id, true)}
                                  disabled={updatingId === order.id}
                                  className="w-full hover:bg-red-500/10 text-gray-600 hover:text-red-400 font-bold py-2 rounded-lg text-[10px] flex items-center justify-center transition-all border border-transparent hover:border-red-400/20"
                                >
                                  {updatingId === order.id ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Trash2 className="w-3 h-3 mr-1.5" />}
                                  Archive from View
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
