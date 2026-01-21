import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const StudentHome = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadData, setUploadData] = useState(null); // { fileUrl, pageCount, fileName }
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    studentName: '',
    contact: '',
    copies: 1,
    color: false, // false = B&W, true = Color
    instructions: '',
    transactionId: ''
  });

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB');
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setLoading(true);

    const data = new FormData();
    data.append('file', selectedFile);

    try {
      const res = await fetch(`${API_URL}/orders/upload`, {
        method: 'POST',
        body: data,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Upload failed');
      }

      const result = await res.json();
      setUploadData(result);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file. Please try again.');
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!uploadData) return 0;
    const rate = formData.color ? 5 : 2; // Pricing logic: 2/page B&W, 5/page Color (as per PRD)
    return uploadData.pageCount * formData.copies * rate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData || !formData.transactionId) return;

    setLoading(true);
    try {
      const orderPayload = {
        ...formData,
        fileUrl: uploadData.fileUrl,
        fileName: uploadData.fileName,
        pageCount: uploadData.pageCount,
        totalCost: calculateTotal(),
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) throw new Error('Order creation failed');

      const orderData = await res.json();
      navigate('/success', { state: { uniqueCode: orderData.uniqueCode } });
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Print Your Documents <span className="text-indigo-600">Instantly</span>
        </h1>
        <p className="text-lg text-gray-600">
          Upload your PDF, pay upfront, and collect it from the campus station next day.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          
          {/* Step 1: Upload */}
          {!uploadData && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-500 transition-colors bg-gray-50/50">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={loading}
              />
              <label 
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="bg-indigo-100 p-4 rounded-full mb-4">
                  <Upload className="h-8 w-8 text-indigo-600" />
                </div>
                <span className="text-xl font-semibold text-gray-900 mb-2">
                  {loading ? 'Uploading & Analyzing...' : 'Click to Upload PDF'}
                </span>
                <span className="text-sm text-gray-500">Max file size 20MB</span>
              </label>
            </div>
          )}

          {/* Step 2: Order Details */}
          {uploadData && (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* File Summary */}
              <div className="flex items-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <FileText className="h-10 w-10 text-indigo-600 mr-4" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{uploadData.fileName}</h3>
                  <p className="text-sm text-gray-600">{uploadData.pageCount} Pages</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setFile(null); setUploadData(null); }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Change File
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Print Options */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Print Configuration</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color Mode</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, color: false})}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                          !formData.color 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        Black & White (₹2/pg)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, color: true})}
                        className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                          formData.color 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        Color (₹5/pg)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Copies</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.copies}
                      onChange={(e) => setFormData({...formData, copies: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                    <input
                      type="text"
                      required
                      value={formData.studentName}
                      onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Payment & Review */}
                <div className="bg-gray-50 p-6 rounded-xl space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Total Pages</span>
                      <span>{uploadData.pageCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Copies</span>
                      <span>{formData.copies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate</span>
                      <span>{formData.color ? '₹5.00' : '₹2.00'} / page</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-semibold text-gray-900 text-lg">Total Amount</span>
                      <span className="font-bold text-2xl text-indigo-600">₹{calculateTotal()}</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Payment Details</p>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded mb-4 text-center">UPI ID: campusprint@upi</p>
                    
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID</label>
                    <input
                      type="text"
                      required
                      value={formData.transactionId}
                      onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter UPI Transaction ID"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                    {!loading && <Check className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </form>
          )}

          {error && (
            <div className="mt-6 flex items-center p-4 text-red-800 bg-red-50 rounded-lg">
              <AlertCircle className="h-5 w-5 mr-3" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
