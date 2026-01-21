import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const StudentHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); // Array of { fileUrl, fileName, pageCount }
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    contact: '',
    copies: 1,
    colorMode: 'bw', // 'bw', 'all', 'selected'
    colorPages: '', // e.g., "1,3,5-7"
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
      setUploadedFiles([...uploadedFiles, result]);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const getTotalPages = () => {
    return uploadedFiles.reduce((sum, f) => sum + f.pageCount, 0);
  };

  const parseColorPagesCount = (input) => {
    if (!input.trim()) return 0;
    let count = 0;
    const parts = input.split(',').map(p => p.trim());
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          count += end - start + 1;
        }
      } else {
        const num = parseInt(part);
        if (!isNaN(num)) count++;
      }
    }
    return count;
  };

  const calculateTotal = () => {
    if (uploadedFiles.length === 0) return 0;
    const totalPages = getTotalPages() * formData.copies;
    
    let colorCount = 0;
    if (formData.colorMode === 'all') {
      colorCount = totalPages;
    } else if (formData.colorMode === 'selected' && formData.colorPages) {
      colorCount = parseColorPagesCount(formData.colorPages) * formData.copies;
      colorCount = Math.min(colorCount, totalPages); // Can't exceed total pages
    }
    
    const bwCount = totalPages - colorCount;
    const printCost = (bwCount * 2) + (colorCount * 10);
    const deliveryFee = 5;
    
    return printCost + deliveryFee;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadedFiles.length === 0 || !formData.transactionId || !formData.name || !formData.usn) return;

    setLoading(true);
    try {
      const orderPayload = {
        name: formData.name,
        usn: formData.usn,
        contact: formData.contact,
        files: uploadedFiles,
        copies: formData.copies,
        colorPages: formData.colorMode === 'all' ? 'all' : (formData.colorMode === 'selected' ? formData.colorPages : ''),
        instructions: formData.instructions,
        totalCost: calculateTotal(),
        transactionId: formData.transactionId,
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
          Upload your PDFs, pay upfront, and collect from the campus station next day.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          
          {/* Step 1: Upload Files */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Upload PDF Files
            </h3>
            
            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 mb-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.fileName}</p>
                        <p className="text-sm text-gray-600">{file.pageCount} pages</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors bg-gray-50/50">
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
                <div className="bg-indigo-100 p-3 rounded-full mb-3">
                  {uploadedFiles.length > 0 ? <Plus className="h-6 w-6 text-indigo-600" /> : <Upload className="h-6 w-6 text-indigo-600" />}
                </div>
                <span className="text-lg font-semibold text-gray-900 mb-1">
                  {loading ? 'Uploading...' : (uploadedFiles.length > 0 ? 'Add Another PDF' : 'Click to Upload PDF')}
                </span>
                <span className="text-sm text-gray-500">Max 20MB per file</span>
              </label>
            </div>
          </div>

          {/* Step 2: Order Details */}
          {uploadedFiles.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column - User & Print Options */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                    Your Details
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">USN *</label>
                    <input
                      type="text"
                      required
                      value={formData.usn}
                      onChange={(e) => setFormData({...formData, usn: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your USN"
                    />
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color Options</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="colorMode"
                          value="bw"
                          checked={formData.colorMode === 'bw'}
                          onChange={(e) => setFormData({...formData, colorMode: e.target.value})}
                          className="text-indigo-600"
                        />
                        <span className="font-medium">All Black & White (₹2/page)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="colorMode"
                          value="all"
                          checked={formData.colorMode === 'all'}
                          onChange={(e) => setFormData({...formData, colorMode: e.target.value})}
                          className="text-indigo-600"
                        />
                        <span className="font-medium">All Color (₹10/page)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="colorMode"
                          value="selected"
                          checked={formData.colorMode === 'selected'}
                          onChange={(e) => setFormData({...formData, colorMode: e.target.value})}
                          className="text-indigo-600"
                        />
                        <span className="font-medium">Selected Pages in Color</span>
                      </label>
                    </div>
                    
                    {formData.colorMode === 'selected' && (
                      <div className="mt-3">
                        <input
                          type="text"
                          value={formData.colorPages}
                          onChange={(e) => setFormData({...formData, colorPages: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., 1,3,5-7"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter page numbers separated by commas. Use dash for ranges.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Payment & Summary */}
                <div className="bg-gray-50 p-6 rounded-xl space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                    Order Summary
                  </h3>
                  
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Files Uploaded</span>
                      <span className="font-medium">{uploadedFiles.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Pages</span>
                      <span className="font-medium">{getTotalPages()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Copies</span>
                      <span className="font-medium">{formData.copies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Print Type</span>
                      <span className="font-medium">
                        {formData.colorMode === 'bw' ? 'All B&W' : formData.colorMode === 'all' ? 'All Color' : 'Mixed'}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Delivery Fee</span>
                      <span>₹5</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-semibold text-gray-900 text-lg">Total Amount</span>
                      <span className="font-bold text-2xl text-indigo-600">₹{calculateTotal()}</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Payment Details</p>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded mb-4 text-center">UPI ID: campusprint@upi</p>
                    
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID *</label>
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
