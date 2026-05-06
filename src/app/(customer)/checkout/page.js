export default function Checkout() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-black text-white mb-4">Checkout</h1>
      <p className="text-gray-400 mb-8">Secure checkout for your marketplace order.</p>
      <div className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-xl text-left">
        <h2 className="text-xl font-bold text-white mb-4">Shipping Address</h2>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <input type="text" placeholder="First Name" className="bg-[#222] border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-temu" />
          <input type="text" placeholder="Last Name" className="bg-[#222] border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-temu" />
          <input type="text" placeholder="Address" className="col-span-2 bg-[#222] border border-gray-700 p-3 rounded text-white focus:outline-none focus:border-temu" />
        </div>
        
        <button className="w-full bg-temu text-white font-bold py-4 rounded-full text-lg hover:bg-orange-600 transition-colors">Place Order</button>
      </div>
    </div>
  );
}
