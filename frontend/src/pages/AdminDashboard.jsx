import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, CheckCircle, Clock, Search, LogOut } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setOrders(orders.filter(order => order._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete order', err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setOrders(orders.map(order => 
          order._id === id ? { ...order, status: newStatus } : order
        ));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const filteredOrders = orders
    .filter(order => filter === 'All' || order.status === filter)
    .filter(order => 
      searchQuery === '' || 
      order.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.contact.includes(searchQuery)
    );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Printed': return 'bg-blue-100 text-blue-800';
      case 'Collected': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 mt-1">Manage and track student print requests</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 font-medium transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {['All', 'Pending', 'Printed', 'Collected'].map((stat) => (
          <button
            key={stat}
            onClick={() => setFilter(stat)}
            className={`p-4 rounded-xl border transition-all text-left ${
              filter === stat 
                ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500 ring-offset-2' 
                : 'bg-white border-gray-200 hover:border-indigo-300'
            }`}
          >
            <p className="text-sm font-medium text-gray-500 uppercase">{stat} Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stat === 'All' ? orders.length : orders.filter(o => o.status === stat).length}
            </p>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No Orders Found</h3>
            <p className="text-gray-500">There are no orders with this status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Code</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Order Info</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-sm">File Details</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Config</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Payment</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {order.uniqueCode || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{order.studentName}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a 
                          href={order.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="truncate max-w-[120px]">{order.fileName}</span>
                        </a>
                        <a
                          href={order.fileUrl}
                          download={order.fileName}
                          className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <p>{order.copies} Copies</p>
                      <p>{order.color ? 'Color' : 'B&W'} • {order.pageCount} Pages</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">₹{order.totalCost}</p>
                      <p className="text-xs font-mono text-gray-500">{order.transactionId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status === 'Pending' && (
                        <button 
                          onClick={() => updateStatus(order._id, 'Printed')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                        >
                          Mark Printed
                        </button>
                      )}
                      {order.status === 'Printed' && (
                        <button 
                          onClick={() => updateStatus(order._id, 'Collected')}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Mark Collected
                        </button>
                      )}
                      {order.status === 'Collected' && (
                        <div className="flex gap-3 justify-end items-center">
                            <span className="text-gray-400 text-sm font-medium">Completed</span>
                            <button 
                              onClick={() => handleDelete(order._id)}
                              className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Order"
                            >
                              <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
