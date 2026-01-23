import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import StudentHome from './pages/StudentHome';
import OrderStatus from './pages/OrderStatus'; // Import
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SuccessPage from './pages/SuccessPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-secondary text-gray-800">
        <Navbar />
        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<StudentHome />} />
            <Route path="/status" element={<OrderStatus />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
