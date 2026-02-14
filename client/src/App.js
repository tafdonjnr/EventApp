import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import './styles/theme.css';

import Home from './pages/Home';
import Register from './pages/Register';
import OrganizerDashboard from './pages/OrganizerDashboard';
import OrganizerProfile from './pages/OrganizerProfile';
import OrganizerLogin from './pages/OrganizerLogin';
import OrganizerRegister from './pages/OrganizerRegister';
import AttendeeRegister  from './pages/AttendeeRegister';
import AttendeeLogin     from './pages/AttendeeLogin';
import AttendeeDashboard from './pages/AttendeeDashboard';
import MyTickets from './pages/MyTickets';
import CreateEvent from './pages/CreateEvent';
import EventDetail from './pages/EventDetail';
import PaymentResult from './pages/PaymentResult';
import TicketSuccess from './pages/TicketSuccess';
import AdminRoutes from './admin/AdminRoutes';
import AdminRoute from './admin/AdminRoute';

// Loading component while auth is being checked
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    color: 'var(--text-accent)',
    fontSize: '1.2rem'
  }}>
    Loading...
  </div>
);

// App content wrapped with auth context
const AppContent = () => {
  const { loading } = useAuth();
  const { isLoaded } = useTheme();

  if (loading || !isLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Organizer Routes */}
        <Route path="/organizer/dashboard" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/organizer/profile" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerProfile />
          </ProtectedRoute>
        } />
        <Route path="/organizer/create-event" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <CreateEvent />
          </ProtectedRoute>
        } />
        <Route path="/organizer/edit-event/:id" element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <CreateEvent />
          </ProtectedRoute>
        } />
        
        {/* Protected Attendee Routes */}
        <Route path="/attendee/dashboard" element={
          <ProtectedRoute allowedRoles={['attendee']}>
            <AttendeeDashboard />
          </ProtectedRoute>
        } />
        <Route path="/attendee/tickets" element={
          <ProtectedRoute allowedRoles={['attendee']}>
            <MyTickets />
          </ProtectedRoute>
        } />
        
        {/* Public Auth Routes */}
        <Route path="/attendee/register" element={<AttendeeRegister />} />
        <Route path="/attendee/login" element={<AttendeeLogin />} />
        <Route path="/organizer/register" element={<OrganizerRegister />} />
        <Route path="/organizer/login" element={<OrganizerLogin />} />
        
        {/* Public Event Route */}
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/payment/result" element={<PaymentResult />} />
        <Route path="/ticket/success" element={<TicketSuccess />} />
        
        {/* Admin Routes — admin role only */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminRoutes />
          </AdminRoute>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
