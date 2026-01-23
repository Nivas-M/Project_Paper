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

  /* Helper to count pages from string input like "1, 3-5" */
  const parseColorPagesCount = (input) => {
    if (!input || !input.trim()) return 0;
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

  /* Helper to expand string input into array of page numbers */
  const normalizePageNumbers = (input, maxPages) => {
    if (!input || !input.trim()) return [];
    const pages = new Set();
    const parts = input.split(',').map(p => p.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= maxPages) pages.add(i);
          }
        }
      } else {
        const num = parseInt(part);
        if (!isNaN(num) && num >= 1 && num <= maxPages) pages.add(num);
      }
    }
    return [...pages].sort((a, b) => a - b);
  };

  const calculateTotal = () => {
    if (uploadedFiles.length === 0) return 0;
    const totalPages = getTotalPages() * formData.copies;
    
    let colorCount = 0;
    if (formData.colorMode === 'all') {
      colorCount = totalPages;
    } else if (formData.colorMode === 'selected') {
      // Sum up color pages from each file's input
      let singleSetColorCount = 0;
      uploadedFiles.forEach(file => {
        singleSetColorCount += parseColorPagesCount(file.colorPagesInput || '');
      });
      colorCount = singleSetColorCount * formData.copies;
      colorCount = Math.min(colorCount, totalPages); 
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
      // Construct Global Color Pages String
      // If File 1 (10 pages) has "1,2" and File 2 (5 pages) has "1",
      // Global string should be "1, 2, 11"
      
      let globalColorString = '';
      if (formData.colorMode === 'selected') {
         const allGlobalPages = [];
         let pageOffset = 0;

         uploadedFiles.forEach(file => {
            const localPages = normalizePageNumbers(file.colorPagesInput || '', file.pageCount);
            const globalPages = localPages.map(p => p + pageOffset);
            allGlobalPages.push(...globalPages);
            pageOffset += file.pageCount;
         });

         globalColorString = allGlobalPages.join(',');
      } else if (formData.colorMode === 'all') {
        globalColorString = 'all';
      }

      const orderPayload = {
        name: formData.name,
        usn: formData.usn,
        contact: formData.contact,
        files: uploadedFiles,
        copies: formData.copies,
        colorPages: globalColorString,
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
      console.error(err);
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary-dark mb-4 tracking-tight">
          Project Paper
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Simplifying campus printing. Upload your documents, track your status, and collect with ease.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-6 md:p-10">
          
          {/* Step 1: Upload Files */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-primary-dark mb-6 flex items-center gap-3">
              <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">1</span>
              Upload Documents
            </h3>
            
            {/* Uploaded Files Grid - Mobile Friendly */}
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative group p-4 bg-surface rounded-2xl border border-secondary-dark hover:border-primary/30 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2.5 rounded-xl">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{file.fileName}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{file.pageCount} pages</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeFile(index)} 
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Modern Upload Area */}
            <div className="relative group">
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
                className={`flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed border-primary/30 rounded-3xl cursor-pointer bg-surface hover:bg-secondary transition-all duration-300 group-hover:border-primary group-hover:shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                  {uploadedFiles.length > 0 ? <Plus className="h-8 w-8 text-primary" /> : <Upload className="h-8 w-8 text-primary" />}
                </div>
                <span className="text-xl font-bold text-primary-dark mb-2">
                  {loading ? 'Uploading...' : (uploadedFiles.length > 0 ? 'Add Another PDF' : 'Drop your PDF here')}
                </span>
                <span className="text-sm text-gray-500">or click to browse • Max 20MB</span>
              </label>
            </div>

            {/* Delivery Notice */}
            <div className="mt-6 p-4 bg-accent/10 rounded-xl flex items-start gap-3 border border-accent/20">
              <AlertCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-900/80">
                <span className="font-bold block mb-1 text-accent-light">Delivery Timeline</span>
                Orders placed between <strong>6:00 AM - 8:00 PM</strong> are delivered tomorrow. Later orders arrive the day after.
              </p>
            </div>
          </div>

          {/* Step 2: Order Details */}
          {uploadedFiles.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-10 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left Column */}
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-primary-dark border-b border-gray-100 pb-4 flex items-center gap-3">
                    <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">2</span>
                    Configuration
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">USN</label>
                      <input
                        type="text"
                        required
                        value={formData.usn}
                        onChange={(e) => setFormData({...formData, usn: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                        placeholder="1DA19CS000"
                      />
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-2">Copies</label>
                     <div className="flex items-center gap-4">
                       <input
                         type="range"
                         min="1"
                         max="10"
                         value={formData.copies}
                         onChange={(e) => setFormData({...formData, copies: parseInt(e.target.value) || 1})}
                         className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                       />
                       <span className="font-bold text-2xl text-primary w-12 text-center">{formData.copies}</span>
                     </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">Print Mode</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'bw', label: 'B&W', sub: '₹2/page' },
                        { id: 'all', label: 'Color', sub: '₹10/page' },
                        { id: 'selected', label: 'Hybrid', sub: 'Mix' }
                      ].map((mode) => (
                        <label key={mode.id} className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.colorMode === mode.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-100 hover:border-gray-200'
                        }`}>
                          <input
                            type="radio"
                            name="colorMode"
                            value={mode.id}
                            checked={formData.colorMode === mode.id}
                            onChange={(e) => setFormData({...formData, colorMode: e.target.value})}
                            className="hidden"
                          />
                          <span className={`font-bold ${formData.colorMode === mode.id ? 'text-primary' : 'text-gray-600'}`}>{mode.label}</span>
                          <span className="text-xs text-gray-400">{mode.sub}</span>
                        </label>
                      ))}
                    </div>
                    
                    {formData.colorMode === 'selected' && (
                      <div className="mt-4 space-y-4 animate-fade-in">
                        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3 text-sm text-yellow-800">
                          <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                          <p>
                            Enter the page numbers you want in color for <strong>each file</strong> below. 
                            We'll handle the rest! (e.g., "1, 3-5")
                          </p>
                        </div>

                        {uploadedFiles.map((file, idx) => (
                           <div key={idx} className="p-4 bg-surface rounded-xl border border-secondary-dark">
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-primary-dark truncate pr-4">
                                  {file.fileName}
                                </label>
                                <span className="text-xs text-gray-500 flex-shrink-0">{file.pageCount} pages</span>
                              </div>
                              <input
                                type="text"
                                placeholder="e.g. 1, 3-5 (or leave empty for none)"
                                value={file.colorPagesInput || ''}
                                onChange={(e) => {
                                  const newFiles = [...uploadedFiles];
                                  newFiles[idx].colorPagesInput = e.target.value;
                                  setUploadedFiles(newFiles);
                                  // Update global color pages just for total calc if needed, 
                                  // but calculateTotal will now read from uploadedFiles directly
                                  setFormData({...formData, colorPages: 'recalc'}); 
                                }}
                                className="w-full px-4 py-2 border border-primary/20 rounded-lg focus:ring-1 focus:ring-primary outline-none text-sm"
                              />
                           </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                      placeholder="Spiral binding, back-to-back, etc."
                      rows={2}
                    />
                  </div>
                </div>

                {/* Right Column - Summary & Payment */}
                <div className="bg-surface p-6 md:p-8 rounded-3xl border border-secondary-dark h-fit sticky top-24">
                  <h3 className="text-xl font-bold text-primary-dark mb-6 flex items-center gap-3">
                    <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md">3</span>
                    Checkout
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Total Pages</span>
                      <span className="font-semibold">{getTotalPages() * formData.copies}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery</span>
                      <span className="font-semibold">₹5.00</span>
                    </div>
                    <div className="pt-4 border-t border-gray-200 space-y-2">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Price Breakdown</p>
                      
                      {(() => {
                        const totalPages = getTotalPages() * formData.copies;
                        let colorCount = 0;
                        if (formData.colorMode === 'all') {
                          colorCount = totalPages;
                        } else if (formData.colorMode === 'selected') {
                          uploadedFiles.forEach(file => {
                            colorCount += parseColorPagesCount(file.colorPagesInput || '');
                          });
                          colorCount = colorCount * formData.copies;
                          colorCount = Math.min(colorCount, totalPages);
                        }
                        const bwCount = totalPages - colorCount;
                        const bwCost = bwCount * 2;
                        const colorCost = colorCount * 10;
                        
                        return (
                          <>
                            {bwCount > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">B&W ({bwCount} pages × ₹2)</span>
                                <span className="font-medium">₹{bwCost}</span>
                              </div>
                            )}
                            {colorCount > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  Color ({colorCount} pages × ₹10)
                                </span>
                                <span className="font-medium">₹{colorCost}</span>
                              </div>
                            )}
                          </>
                        );
                      })()}

                      <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                        <span className="text-lg font-bold text-gray-800">Total</span>
                        <span className="text-4xl font-extrabold text-primary">₹{calculateTotal()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pay to UPI</p>
                      <p className="font-mono text-lg font-medium text-gray-800 select-all">campusprint@upi</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction ID / UTR</label>
                      <input
                        type="text"
                        required
                        value={formData.transactionId}
                        onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                        placeholder="Enter 12-digit UTR"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                  >
                    {loading ? 'Processing...' : 'Confirm Order'}
                    {!loading && <Check className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>
              </div>
            </form>
          )}

          {error && (
            <div className="mt-8 flex items-center p-4 text-red-800 bg-red-50 rounded-xl border border-red-100 animate-fade-in-up">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
