import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedOrganizerRoute from './components/ProtectedOrganizerRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Navbar from './components/Navbar';
import './styles/theme.css';
import './styles/globals.css';

import Home from './pages/Home';
import Register from './pages/Register';
import OrganizerLogin from './pages/OrganizerLogin';
import OrganizerRegister from './pages/OrganizerRegister';
import AdminLogin from './pages/AdminLogin';
import OrganizerLayout from './organizer/OrganizerLayout';
import Overview from './organizer/pages/Overview';
import MyEvents from './organizer/pages/MyEvents';
import CreateEvent from './organizer/pages/CreateEvent';
import Profile from './organizer/pages/Profile';
import AttendeeRegister  from './pages/AttendeeRegister';
import AttendeeLogin     from './pages/AttendeeLogin';
import AttendeeDashboard from './pages/AttendeeDashboard';
import MyTickets from './pages/MyTickets';
import EventDetail from './pages/EventDetail';
import PaymentResult from './pages/PaymentResult';
import TicketSuccess from './pages/TicketSuccess';
import AdminRoutes from './admin/AdminRoutes';

// Loading component while auth is being checked
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen body-text">
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
      <main className="min-h-screen" style={{ paddingTop: 'var(--navbar-height)' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />

        {/* Public Auth */}
        <Route path="/organizer/register" element={<OrganizerRegister />} />
        <Route path="/organizer/login" element={<OrganizerLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Organizer Routes — /dashboard, organizer role only */}
        <Route path="/dashboard" element={<ProtectedOrganizerRoute><OrganizerLayout /></ProtectedOrganizerRoute>}>
          <Route index element={<Overview />} />
          <Route path="events" element={<MyEvents />} />
          <Route path="create" element={<CreateEvent />} />
          <Route path="edit/:id" element={<CreateEvent />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        
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
        
        {/* Public Attendee Auth */}
        <Route path="/attendee/register" element={<AttendeeRegister />} />
        <Route path="/attendee/login" element={<AttendeeLogin />} />
        
        {/* Public Event Route */}
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/payment/result" element={<PaymentResult />} />
        <Route path="/ticket/success" element={<TicketSuccess />} />
        
        {/* Admin Routes — /admin, admin role only; /admin/login is public above */}
        <Route path="/admin/*" element={
          <ProtectedAdminRoute>
            <AdminRoutes />
          </ProtectedAdminRoute>
        } />
      </Routes>
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
          <Analytics />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
