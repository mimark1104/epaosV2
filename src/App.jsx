// src/App.jsx

import { Routes, Route } from 'react-router-dom';

// Make sure ALL of these end in .jsx
import AdmissionForm from './pages/AdmissionForm.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function App() {
  return (
    <Routes>
      {/* Homepage is the admission form */}
      <Route path="/" element={<AdmissionForm />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;