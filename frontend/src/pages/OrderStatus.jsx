import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const OrderStatus = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchMode, setSearchMode] = useState('id'); // 'id' or 'name'

  const checkStatus = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);
    setOrders([]);

    try {
      if (searchMode === 'id') {
        const res = await fetch(`${API_URL}/orders/status/${orderId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Order not found. Please check your Order ID.');
          throw new Error('Failed to fetch status');
        }
        const data = await res.json();
        setOrder(data);
      } else {
        // Search by name
        const res = await fetch(`${API_URL}/orders/search/${encodeURIComponent(orderId)}`);
        if (!res.ok) throw new Error('Failed to search orders');
        const data = await res.json();
        if (data.length === 0) {
          setError('No orders found for this name.');
        } else {
          setOrders(data);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Printed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Collected': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
        <p className="text-gray-600">Enter your Order ID or Student Name to track your order.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        {/* Toggle Search Mode */}
        <div className="flex gap-2 mb-4 justify-center">
          <button
            type="button"
            onClick={() => { setSearchMode('id'); setOrderId(''); setOrder(null); setOrders([]); setError(null); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              searchMode === 'id' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Search by ID / Code
          </button>
          <button
            type="button"
            onClick={() => { setSearchMode('name'); setOrderId(''); setOrder(null); setOrders([]); setError(null); }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              searchMode === 'name' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Search by Name
          </button>
        </div>

        <form onSubmit={checkStatus} className="flex gap-4 mb-8">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder={searchMode === 'id' ? 'Enter Order ID or Tracking Code' : 'Enter Student Name'}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
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
          <div className="flex items-center p-4 text-red-800 bg-red-50 rounded-lg border border-red-100 mb-6">
            <AlertCircle className="h-5 w-5 mr-3" />
            {error}
          </div>
        )}

        {/* Single Order Display */}
        {order && (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono font-medium text-gray-900">{order._id}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Package className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">File Name</p>
                  <p className="font-medium text-gray-900">{order.fileName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ordered At</p>
                  <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {order.status === 'Collected' && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center gap-3 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-medium">This order has been picked up.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Multiple Orders Display (from name search) */}
        {orders.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">Found {orders.length} order(s)</p>
            {orders.map((ord) => (
              <div key={ord._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-mono text-sm font-medium text-gray-900">{ord._id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(ord.status)}`}>
                    {ord.status}
                  </span>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-900">{ord.fileName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-600">{new Date(ord.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">₹{ord.totalCost}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
