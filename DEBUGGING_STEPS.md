# PDF Upload Debugging Steps

## Changes Made:

### 1. Backend Configuration (`backend/config/cloudinary.js`)
- ✅ Changed `params` to async function
- ✅ Set `resource_type` to "raw" for PDFs (instead of "auto")
- ✅ Added file size limit (20MB)
- ✅ Added file type filter

### 2. Backend Server (`backend/index.js`)
- ✅ Added body size limits for JSON and URL-encoded data

### 3. Frontend Error Handling (`frontend/src/pages/StudentHome.jsx`)
- ✅ Improved error messages to show actual error from server

## Steps to Test:

1. **Check Environment Variables**
   - Make sure you have a `backend/.env` file with:
     ```
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     MONGO_URI=your_mongodb_connection
     PORT=5000
     ```

2. **Restart Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

3. **Check Backend Console**
   - Look for "MongoDB Connected"
   - Look for "Server running on port 5000"
   - Watch for any error messages when you upload

4. **Test Upload**
   - Try uploading a small PDF first (< 1MB)
   - Check browser console (F12) for error details
   - Check backend terminal for detailed error logs

## Common Issues:

### If you see "Error uploading file to cloud":
- **Check Cloudinary credentials** in `.env`
- Run `node backend/test-upload.js` to verify connection

### If you see "No file uploaded":
- File might be too large
- Wrong file type (must be PDF)

### If you see network errors:
- Backend server not running
- CORS issues (check backend is on port 5000)
- Wrong API_URL in `frontend/.env`

## Test Cloudinary Connection:
```bash
cd backend
node test-upload.js
```

This should print "✓ Cloudinary connection successful!" if credentials are correct.
