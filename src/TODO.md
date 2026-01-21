# CampusPrint Project TODO List

Based on `CampusPrint_TechStack.pdf` and `yes.pdf` (PRD).

## 1. Project Initialization

- [x] **Repository Setup**: Initialize Git repository.
- [x] **Structure**: Create standard folders:
  - `frontend/` (React + Tailwind)
  - `backend/` (Node.js + Express)
- [x] **Environment Variables**: Create `.env` templates for both frontend (API URL) and backend (Mongo URI, Cloudinary, JWT Secret).

## 2. Backend Development (Node.js, Express, MongoDB)

### Setup

- [x] Initialize Node.js project (`npm init`).
- [x] Install dependencies: `express`, `mongoose`, `cors`, `dotenv`, `multer`, `cloudinary`, `pdf-parse`, `jsonwebtoken`.
- [x] Configure MongoDB Atlas connection.
- [x] Configure Cloudinary for file storage.

### Database Models

- [x] **Order Model**:
  - Student Details (Name, Contact - minimal).
  - Print Specs (PDF Link, Page Count, Copies, Color/BW, Instructions).
  - Status (Pending, Printed, Collected).
  - Payment (Transaction ID, Amount, Timestamp).
- [ ] **Admin Model** (if needed, or hardcode single admin credential handling for simplicity/JWT).

### API Endpoints

- [x] `POST /api/upload`:
  - Middleware: `multer` for file handling.
  - Action: Upload to Cloudinary.
  - Action: Parse PDF (`pdf-parse`) to get page count.
  - Return: File URL and Page Count.
- [x] `POST /api/orders`:
  - Input: Student data, File URL, Print Options, Transaction ID.
  - Action: Save to MongoDB.
- [x] `GET /api/orders` (Protected):
  - Input: Admin Token.
  - Return: List of all orders (support filtering).
- [x] `PATCH /api/orders/:id/status` (Protected):
  - Input: New status.
  - Action: Update order status.
- [x] `POST /api/auth/login`:
  - Input: Admin credentials.
  - Return: JWT Token.

## 3. Frontend Development (React, Tailwind CSS)

### Setup

- [x] Initialize React app (Vite).
- [x] Install & Configure Tailwind CSS.
- [x] Setup Routing (`react-router-dom` if multiple pages needed, mainly separate Admin route).

### Student Interface (Public)

- [x] **Hero/Upload Section**:
  - File input (Drag & Drop).
  - Max size 20MB validation.
- [x] **Order Configuration**:
  - Toggle: Color/B&W.
  - Input: Number of copies.
  - Input: Special Instructions.
  - Display: Auto-calculated Price (based on page count \* rate).
- [x] **Payment & Checkout**:
  - Display QR Code/Payment Details (Static UI).
  - Input: Transaction ID.
  - Submit Button -> Call `POST /api/orders`.
- [x] **Success Screen**:
  - Show Order ID and "Collect Next Day" message.

### Admin Dashboard (Private)

- [x] **Login Page**: Simple username/password form.
- [x] **Dashboard Home**:
  - Table of orders.
  - Columns: ID, Time, File (Link), Pages, Cost, Trans ID, Status.
  - Action: "Download PDF" button.
- [x] **Order Management**:
  - Marking orders as "Printed" or "Collected".

## 4. Testing & QA

- [ ] Test PDF upload limits and file types.
- [ ] Verify Page Count extraction accuracy.
- [ ] Test Admin authentication flow.
- [ ] Verify Responsive Design (Mobile for students).

## 5. Deployment

- [ ] **Backend**: Deploy to Render or Railway (Free Tier).
  - Set environment variables on host.
- [ ] **Frontend**: Deploy to Vercel.
  - Configure build settings.
