import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { user } = useAuth()
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
            <span className="block">Organize your tasks with</span>
            <span className="block text-blue-500">TodoApp</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Stay organized, focused, and productive with our intuitive task management solution. Track your progress and achieve your goals efficiently.
          </p>
          
          {/* Only show auth buttons if user is not logged in */}
          {!user && (
            <div className="mt-10 flex justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-300"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="rounded-full bg-gray-700 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-gray-600 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Show different CTA for logged in users */}
          {user && (
            <div className="mt-10 flex justify-center gap-x-6">
              <Link
                to="/dashboard"
                className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-300"
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative p-6 bg-gray-800 rounded-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-blue-500 rounded-full p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Task Management</h3>
              <p className="mt-2 text-gray-300">Create, organize, and track your tasks with ease</p>
            </div>

            <div className="relative p-6 bg-gray-800 rounded-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-blue-500 rounded-full p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Progress Tracking</h3>
              <p className="mt-2 text-gray-300">Monitor your productivity and task completion</p>
            </div>

            <div className="relative p-6 bg-gray-800 rounded-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-blue-500 rounded-full p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Quick Actions</h3>
              <p className="mt-2 text-gray-300">Efficiently manage and update your tasks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home