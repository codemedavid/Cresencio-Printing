import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Homepage from './components/Homepage';
import VipRegistration from './components/VipRegistration';
import VipLogin from './components/VipLogin';
import VipProfile from './components/VipProfile';
import JobOrderCreation from './components/JobOrderCreation';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { VipProvider } from './contexts/VipContext';

function App() {
  return (
    <VipProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* Debug Navigation */}
      
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/register" element={<VipRegistration />} />
            <Route path="/login" element={<VipLogin />} />
            <Route path="/profile" element={<VipProfile />} />
            <Route path="/new-order" element={<JobOrderCreation />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </VipProvider>
  );
}

export default App;