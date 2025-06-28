import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    theme: 'dark',
    emailNotifications: true,
    taskReminders: true,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
  
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try { 
      const response = await fetch('http://localhost:5000/api/v2/settings', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)

  // const handleSave = async () => {
  //   setIsSaving(true)
  //   // TODO: Implement settings update logic
  //   setTimeout(() => setIsSaving(false), 1000)
  // }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/v2/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('http://localhost:5000/api/v2/settings/account', {
          method: 'DELETE',
          credentials: 'include',
          headers: {
          'Content-Type': 'application/json'
        }
        });

        if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete account');
      }

      await logout();
      navigate('/');
      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account');
    }
    }
  };
 const handleExportData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v2/settings/export', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'todo-app-data.json';
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Data exported successfully');
      }
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Settings</h2>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700">
            <nav className="flex space-x-4 px-6" aria-label="Tabs">
              {['general', 'notifications', 'privacy', 'appearance'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-4 text-sm font-medium ${
                    activeTab === tab
                      ? 'text-blue-500 border-b-2 border-blue-500'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-400">Receive updates about your tasks via email</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                    className={`${
                      settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-600'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
                  >
                    <span
                      className={`${
                        settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Task Reminders</h3>
                    <p className="text-sm text-gray-400">Get notifications before task deadlines</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, taskReminders: !settings.taskReminders })}
                    className={`${
                      settings.taskReminders ? 'bg-blue-600' : 'bg-gray-600'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out`}
                  >
                    <span
                      className={`${
                        settings.taskReminders ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-1`}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Data & Privacy</h3>
                  <button 
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete Account
                  </button>
                  <p className="mt-2 text-sm text-gray-400">
                    Once you delete your account, it cannot be recovered.
                  </p>
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Export Data
                  </button>
                  <p className="mt-2 text-sm text-gray-400">
                    Download all your tasks and account data.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-700 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings