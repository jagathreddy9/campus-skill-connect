import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CompleteProfile from './pages/CompleteProfile';
import TutorProfile from './pages/TutorProfile';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/profile/:id" element={<TutorProfile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
