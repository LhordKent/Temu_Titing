'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin, Phone, CreditCard, Banknote } from 'lucide-react';

export default function Checkout() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('user_id', user.id);
      if (error) throw error;
      if (!data || data.length === 0) {
        router.push('/cart');
        return;
      }
      setCartItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!profile?.address || !profile?.phone) {
      alert('Please complete your profile details (address and phone) before checking out.');
      router.push('/profile');
      return;
    }

    setPlacing(true);
    try {
      // 0. Check stock validity
      for (const item of cartItems) {
        if (item.quantity > item.product.stock_quantity) {
          throw new Error(`Not enough stock for ${item.product.title}. Only ${item.product.stock_quantity} left.`);
        }
      }

      // 1. Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: user.id,
          seller_id: cartItems[0].product.seller_id, // Simplified: assumes one seller per order for now
          total_amount: subtotal,
          status: 'pending',
          shipping_address: {
            full_name: profile.full_name,
            phone: profile.phone,
            address: profile.address
          }
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_purchase: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Decrement stock for each product
      for (const item of cartItems) {
        const newStock = item.product.stock_quantity - item.quantity;
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product.id);
          
        if (stockError) {
          console.error("Failed to update stock for product", item.product.id, stockError);
        }
      }

      // 4. Clear cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      alert(`Order placed successfully using ${paymentMethod.toUpperCase()}!`);
      router.push('/');
    } catch (err) {
      alert('Error placing order: ' + err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-temu" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-white mb-8 text-center">Finalize Order</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Details */}
        <div className="space-y-6">
          {/* Shipping Section */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-temu mr-2" />
              <h2 className="text-lg font-bold text-white">Delivery Address</h2>
            </div>
            {profile?.address ? (
              <div className="text-gray-300 text-sm space-y-1">
                <p className="font-bold text-white">{profile.full_name}</p>
                <p>{profile.phone}</p>
                <p>{profile.address}</p>
                <button onClick={() => router.push('/profile')} className="text-temu text-xs mt-2 hover:underline">Change</button>
              </div>
            ) : (
              <button onClick={() => router.push('/profile')} className="w-full py-3 border border-dashed border-gray-700 rounded-xl text-gray-500 hover:border-temu hover:text-temu transition-all">
                + Add Address & Phone
              </button>
            )}
          </div>

          {/* Payment Section */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Payment Method</h2>
            <div className="space-y-3">
               <button 
                onClick={() => setPaymentMethod('cod')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${paymentMethod === 'cod' ? 'border-temu bg-temu/10' : 'border-gray-800 bg-[#222]'}`}
               >
                 <div className="flex items-center">
                   <Banknote className="w-5 h-5 mr-3" />
                   <span className="font-medium">Cash on Delivery (COD)</span>
                 </div>
                 <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'cod' ? 'border-temu bg-temu' : 'border-gray-600'}`}></div>
               </button>

               <button 
                onClick={() => setPaymentMethod('gcash')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${paymentMethod === 'gcash' ? 'border-temu bg-temu/10' : 'border-gray-800 bg-[#222]'}`}
               >
                 <div className="flex items-center">
                   <CreditCard className="w-5 h-5 mr-3" />
                   <span className="font-medium">GCash</span>
                 </div>
                 <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'gcash' ? 'border-temu bg-temu' : 'border-gray-600'}`}></div>
               </button>
            </div>
          </div>
        </div>

        {/* Right Side: Summary */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 h-fit sticky top-24">
           <h2 className="text-lg font-bold text-white mb-6">Order Summary</h2>
           <div className="space-y-4 mb-6">
             {cartItems.map(item => (
               <div key={item.id} className="flex justify-between text-sm">
                 <span className="text-gray-400">{item.quantity}x {item.product.title}</span>
                 <span className="text-white">₱{item.product.price * item.quantity}</span>
               </div>
             ))}
           </div>
           
           <div className="border-t border-gray-800 pt-4 space-y-2">
             <div className="flex justify-between text-gray-400">
               <span>Subtotal</span>
               <span>₱{subtotal}</span>
             </div>
             <div className="flex justify-between text-gray-400">
               <span>Shipping Fee</span>
               <span className="text-green-400 font-bold">FREE</span>
             </div>
             <div className="flex justify-between items-baseline pt-4">
               <span className="text-lg font-bold text-white">Grand Total</span>
               <span className="text-2xl font-black text-temu">₱{subtotal}</span>
             </div>
           </div>

           <button 
            onClick={handlePlaceOrder}
            disabled={placing}
            className="w-full mt-8 bg-temu hover:bg-orange-600 text-white font-bold py-4 rounded-full text-lg shadow-lg shadow-orange-900/50 transition-all flex items-center justify-center disabled:opacity-50"
           >
             {placing ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
             {placing ? 'Processing...' : 'Place Order Now'}
           </button>
        </div>
      </div>
    </div>
  );
}

