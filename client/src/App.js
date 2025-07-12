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
import AttendeeDashboard from './pages/AttendeeDashboard';
import CreateEvent from './pages/CreateEvent';
import EventDetail from './pages/EventDetail';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        <Route path="/organizer/profile" element={<OrganizerProfile />} />
        <Route path="/organizer/create-event" element={<CreateEvent />} />
        <Route path="/organizer/edit-event/:id" element={<CreateEvent />} />
        <Route path="/attendee/register"  element={<AttendeeRegister />} />
        <Route path="/attendee/login" element={<AttendeeLogin />} />
        <Route path="/attendee/dashboard" element={<AttendeeDashboard />} />
        <Route path="/organizer/register" element={<OrganizerRegister />} />
        <Route path="/organizer/login" element={<OrganizerLogin />} />
        <Route path="/events/:id" element={<EventDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
