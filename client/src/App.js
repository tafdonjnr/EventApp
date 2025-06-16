import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Register from './pages/Register';
import OrganizerDashboard from './pages/OrganizerDashboard';
import OrganizerProfile from './pages/OrganizerProfile';
import OrganizerLogin from './pages/OrganizerLogin';
import OrganizerRegister from './pages/OrganizerRegister';
import AttendeeRegister  from './pages/AttendeeRegister';
import AttendeeLogin     from './pages/AttendeeLogin';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        <Route path="/organizer/profile" element={<OrganizerProfile />} />
        <Route path="/attendee/register"  element={<AttendeeRegister />} />
        <Route path="/attendee/login" element={<AttendeeLogin />} />
        <Route path="/organizer/register" element={<OrganizerRegister />} />
        <Route path="/organizer/login" element={<OrganizerLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
