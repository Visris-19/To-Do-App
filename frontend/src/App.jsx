import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'
import Privacy from './pages/Privacy'
import Settings from './pages/Settings'
import Tasks from './pages/Tasks'
import { AuthProvider } from './context/AuthContext'
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import ProtectedRoute from './components/ProtectedRoute'
import EmailVerification from './pages/EmailVerification';
import ResendVerification from './pages/ResendVerification';
import NotFound from './pages/NotFound';



function App() {
  return (
    <Router>
      <AuthProvider>
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <main className="flex-grow">
        <Routes>
  {/* Public routes */}
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/privacy" element={<Privacy />} />
  <Route path="/terms" element={<Terms />} />
  <Route path="/cookies" element={<Cookies />} />
  <Route path="/verify-email" element={<EmailVerification />} />
  <Route path="/resend-verification" element={<ResendVerification />} />

  {/* Protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/tasks" element={<Tasks />} />
  </Route>

  {/* 404 Route - Must be last */}
  <Route path="*" element={<NotFound />} />
</Routes>
      </main>
      <CookieConsent />
      <Footer />
    </div>
      </AuthProvider>
    </Router>
  )
}

export default App
