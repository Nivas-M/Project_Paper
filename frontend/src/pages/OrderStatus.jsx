import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const OrderStatus = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkStatus = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch(`${API_URL}/orders/status/${orderId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Order not found. Please check your Order ID or Code.');
        throw new Error('Failed to fetch status');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Printed': return 'text-primary bg-primary/5 border-primary/20';
      case 'Collected': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-primary-dark mb-3">Track Your Order</h1>
        <p className="text-gray-600">Enter your Order ID or tracking code below.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100">
        
        <form onSubmit={checkStatus} className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Order ID / Tracking Code"
            className="flex-1 px-5 py-4 bg-surface border border-secondary-dark rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : (
              <>
                <Search className="h-5 w-5" />
                Track
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="flex items-center p-4 text-red-800 bg-red-50 rounded-xl border border-red-100 mb-8 animate-fade-in">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Single Order Display */}
        {order && (
          <div className="border border-secondary-dark rounded-2xl overflow-hidden animate-fade-in-up">
            <div className="bg-surface p-5 border-b border-secondary-dark flex flex-wrap gap-4 justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
                <p className="font-mono font-bold text-gray-900">{order.uniqueCode || order._id}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl flex-shrink-0">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Files</p>
                  <p className="font-semibold text-gray-900">{order.fileName}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-xl flex-shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Ordered At</p>
                  <p className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {order.status === 'Collected' && (
                <div className="mt-6 p-4 bg-green-50 rounded-xl flex items-center gap-3 text-green-800 border border-green-100">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-medium">This order has been picked up.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
