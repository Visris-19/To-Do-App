import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const BACKEND_URL = 'http://localhost:5000';
  const { user, logout, updateUserData } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [avatar, setAvatar] = useState(user?.avatar || null);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/logout', {
        method: 'POST',
        credentials: 'include'
      })
      if (response.ok) {
        logout()
        navigate('/')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }


  useEffect(() => {
    console.group('Navbar Debug')
    console.log('User state:', user)
    console.log('User authenticated:', !!user)
    console.log('Current location:', location.pathname)
    console.groupEnd()
  }, [user, location])

  // Navigation Links Section
  const navigationLinks = (
    <div className="hidden md:flex items-center space-x-4">
      <Link
        to="/"
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          location.pathname === '/'
            ? 'text-white bg-gray-800'
            : 'text-gray-300 hover:text-white hover:bg-gray-700'
        }`}
      >
        Home
      </Link>
      {user && (
        <>
          <Link
            to="/dashboard"
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              location.pathname === '/dashboard'
                ? 'text-white bg-gray-800'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/tasks"
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              location.pathname === '/tasks'
                ? 'text-white bg-gray-800'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            Tasks
          </Link>
        </>
      )}
    </div>
  )
  const fetchAvatar = async () => {
     try {
      const response = await fetch('http://localhost:5000/api/v2/profile', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.avatar) {
        const avatarUrl = `${BACKEND_URL}${data.avatar}`;
        setAvatar(avatarUrl);
        updateUserData({ avatar: avatarUrl }); // Update auth context
      }
          } catch (error) {
            console.error('Profile fetch error:', error);
            toast.error('Failed to load profile data');
  }
}
  useEffect(() => {
    fetchAvatar()
  }, [user?.avatar])
  // Ensure avatar is fetched when user changes
  // Auth Buttons Section
  const authButtons = (
    <div className="flex items-center space-x-4">
      {user ? (
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              {avatar ? (
                <img 
                  src={avatar}
                  alt={user?.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="hidden md:block">{user.username}</span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                {/* Add overlay to capture clicks and provide backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-56 rounded-lg shadow-xl bg-gray-800/95 ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div className="p-2 space-y-1">
                    {/* User Info Section */}
                    <div className="px-3 py-2 border-b border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.username} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-lg font-medium">
                              {user.username?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{user.username}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </Link>

                    <div className="border-t border-gray-700 my-1"></div>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </>
      )}
    </div>
  )

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="ml-2 text-xl font-bold text-white">TodoApp</span>
            </Link>
          </div>
          {navigationLinks}
          {authButtons}
        </div>
      </div>
    </nav>
  )
}

export default Navbar