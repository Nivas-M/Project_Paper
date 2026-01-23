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
      (order.name && order.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.usn && order.usn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.contact && order.contact.includes(searchQuery))
    );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Printed': return 'bg-primary/10 text-primary border-primary/20';
      case 'Collected': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDownloadUrl = (url, fileName) => {
    if (!url) return '#';
    // Ensure filename ends with .pdf
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const attachmentName = safeName.toLowerCase().endsWith('.pdf') ? safeName : `${safeName}.pdf`;

    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      if (url.includes('/raw/upload/')) {
        // For raw files, we can't always transform, but we can try 
        // appending the attachment name if the API supports it, or just return the URL
        // A common Cloudinary trick for raw files is fl_attachment
        return url.replace('/upload/', `/upload/fl_attachment:${attachmentName}/`);
      }
      return url.replace('/upload/', `/upload/fl_attachment:${attachmentName}/`);
    }
    return url;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">Order Management</h1>
          <p className="text-gray-500 mt-1">Manage and track student print requests</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 font-medium transition-colors bg-white rounded-lg border border-gray-200 hover:border-red-200"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name or USN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm"
          />
        </div>
        
        {/* Filter Pills */}
        <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 no-scrollbar">
          {['All', 'Pending', 'Printed', 'Collected'].map((stat) => (
            <button
              key={stat}
              onClick={() => setFilter(stat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                filter === stat 
                  ? 'bg-primary text-white border-primary shadow-md' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:text-primary'
              }`}
            >
              {stat} <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${filter === stat ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {stat === 'All' ? orders.length : orders.filter(o => o.status === stat).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <div className="bg-gray-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Orders Found</h3>
          <p className="text-gray-500">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Code</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Student</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Files</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Config</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Total</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                        {order.uniqueCode || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{order.name || order.studentName || '-'}</p>
                      {order.usn && <p className="text-xs text-primary font-medium">{order.usn}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.files ? (
                          order.files.map((file, idx) => (
                            <a 
                              key={idx}
                              href={getDownloadUrl(file.fileUrl, file.fileName)}
                              className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium text-sm group"
                              title="Download PDF"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="truncate max-w-[120px] group-hover:underline">{file.fileName}</span>
                            </a>
                          ))
                        ) : (
                          <a 
                            href={getDownloadUrl(order.fileUrl, order.fileName)}
                            className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium text-sm group"
                            title="Download PDF"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="truncate max-w-[120px] group-hover:underline">{order.fileName}</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className="font-medium text-gray-900">{order.copies} Copies</p>
                      {/* Color Mode Display */}
                      {order.colorPages === 'all' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          🎨 All Color
                        </span>
                      ) : order.colorPages ? (
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            🎨 Mixed
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          ⬛ All B&W
                        </span>
                      )}
                      
                      {/* Instructions - Desktop */}
                      {order.instructions && (
                        <div className="mt-2 p-1.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 break-words max-w-[200px]">
                          📝 {order.instructions}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">₹{order.totalCost}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status === 'Pending' && (
                        <button onClick={() => updateStatus(order._id, 'Printed')} className="text-blue-600 hover:text-blue-800 text-sm font-bold">Print</button>
                      )}
                      {order.status === 'Printed' && (
                        <button onClick={() => updateStatus(order._id, 'Collected')} className="text-green-600 hover:text-green-800 text-sm font-bold">Collect</button>
                      )}
                      {order.status === 'Collected' && (
                        <button onClick={() => handleDelete(order._id)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50">
                          <LogOut className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-1 rounded inline-block mb-2">
                       {order.uniqueCode}
                    </span>
                    <h3 className="font-bold text-lg text-gray-900">{order.name || order.studentName}</h3>
                    <p className="text-sm text-gray-500">{order.usn}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                   <div className="flex items-center gap-2 text-sm text-gray-600">
                     <FileText className="h-4 w-4 text-primary" />
                     {order.files ? (
                       <span className="truncate max-w-[200px]">{order.files.length} files ({order.files.reduce((s, f) => s + f.pageCount, 0)} pages)</span>
                     ) : (
                       <span>{order.pageCount} pages</span>
                     )}
                   </div>
                   
                   {/* Instructions - Mobile */}
                   {order.instructions && (
                     <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 text-sm text-yellow-800">
                       <span className="font-bold block text-yellow-900 mb-1">📝 Note:</span>
                       {order.instructions}
                     </div>
                   )}

                   <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                     <span className="text-sm font-medium text-gray-600">{order.copies} Copies • {order.colorPages === 'all' ? 'Color' : 'B&W'}</span>
                     <span className="font-bold text-lg text-primary">₹{order.totalCost}</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {order.files ? (
                    order.files.map((file, idx) => (
                             <a 
                               key={idx}
                               href={getDownloadUrl(file.fileUrl, file.fileName)}
                               download={file.fileName}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium text-sm group"
                               title="Download PDF"
                             >
                         <Download className="h-4 w-4" />
                         File {idx + 1}
                       </a>
                    ))
                  ) : (
                    <a 
                       href={getDownloadUrl(order.fileUrl, order.fileName)}
                       className="flex items-center justify-center gap-2 py-2.5 bg-secondary text-primary-dark font-semibold rounded-lg text-sm border border-secondary-dark col-span-2"
                     >
                       <Download className="h-4 w-4" />
                       Download PDF
                     </a>
                  )}
                  
                  {order.status === 'Pending' && (
                    <button 
                      onClick={() => updateStatus(order._id, 'Printed')}
                      className="col-span-2 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-sm shadow-sm active:scale-95 transition-transform"
                    >
                      Mark as Printed
                    </button>
                  )}
                  {order.status === 'Printed' && (
                    <button 
                      onClick={() => updateStatus(order._id, 'Collected')}
                      className="col-span-2 py-2.5 bg-green-600 text-white font-bold rounded-lg text-sm shadow-sm active:scale-95 transition-transform"
                    >
                      Mark as Collected
                    </button>
                  )}
                  {order.status === 'Collected' && (
                    <button 
                      onClick={() => handleDelete(order._id)}
                      className="col-span-2 py-2.5 bg-red-50 text-red-600 font-bold rounded-lg text-sm border border-red-100"
                    >
                      Delete Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
