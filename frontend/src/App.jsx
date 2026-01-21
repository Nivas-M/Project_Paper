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
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <Navbar />
        <Routes>
          <Route path="/" element={<StudentHome />} />
          <Route path="/status" element={<OrderStatus />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
