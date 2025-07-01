import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import ErrorAlert from '../components/ErrorAlert'

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Default settings with proper fallbacks
  const defaultSettings = {
    theme: 'dark',
    emailNotifications: true,
    taskReminders: true,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/v2/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        await logout();
        navigate('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        // Merge fetched settings with defaults to ensure all properties exist
        setSettings(prev => ({ ...defaultSettings, ...data }));
      } else if (response.status === 404) {
        // No settings found - this is fine, we'll use defaults
        console.log('No existing settings found, using defaults');
        setSettings(defaultSettings);
      } else {
        // Other errors
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to load settings (${response.status})`);
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
      
      // Check if it's a network error or server unavailable
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setErrors(prev => ({
          ...prev,
          general: 'Unable to connect to server. Using default settings.'
        }));
        toast.error('Connection error - using default settings');
      } else {
        setErrors(prev => ({
          ...prev,
          general: error.message || 'Failed to load settings. Using defaults.'
        }));
        toast.error('Failed to load settings - using defaults');
      }
      
      // Use defaults if fetch fails
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});
    
    try {
      // Validate settings before sending
      if (!settings.language || !settings.timezone) {
        setErrors(prev => ({
          ...prev,
          validation: 'Please fill in all required fields'
        }));
        return;
      }

      // Clean the settings object to only send what's needed
      const settingsToSave = {
        theme: settings.theme || 'dark',
        emailNotifications: Boolean(settings.emailNotifications),
        taskReminders: Boolean(settings.taskReminders),
        language: settings.language || 'en',
        timezone: settings.timezone || 'UTC'
      };

      console.log('Saving settings:', settingsToSave);

      const response = await fetch('http://localhost:5000/api/v2/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(settingsToSave)
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        await logout();
        navigate('/login');
        return;
      }

      if (response.ok) {
        const updatedSettings = await response.json();
        // Merge updated settings with defaults
        setSettings(prev => ({ ...defaultSettings, ...updatedSettings }));
        toast.success('Settings saved successfully', {
          style: {
            background: '#1f2937',
            color: '#10b981',
            border: '1px solid #10b981'
          }
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to save settings (${response.status})`);
      }
    } catch (error) {
      console.error('Save settings error:', error);
      setErrors(prev => ({
        ...prev,
        save: error.message || 'Failed to save settings'
      }));
      toast.error(error.message || 'Failed to save settings', {
        style: {
          background: '#1f2937',
          color: '#ef4444',
          border: '1px solid #ef4444'
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('http://localhost:5000/api/v2/account', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          await logout();
          navigate('/login');
          return;
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
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
      const response = await fetch('http://localhost:5000/api/v2/export', {
        credentials: 'include'
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        await logout();
        navigate('/login');
        return;
      }
      
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
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to export data');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to export data');
    }
  };

  const dismissError = (field) => {
    setErrors(prev => {
      const { [field]: removedError, ...rest } = prev;
      return rest;
    });
  };

  // Safe update function that preserves defaults
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <p className="text-sm text-gray-400 mt-1">Manage your account preferences and settings</p>
          </div>

          {/* Error Alert */}
          <div className="px-6 pt-4">
            <ErrorAlert 
              errors={errors} 
              className="mb-4" 
              onDismiss={dismissError}
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-700">
            <nav className="flex space-x-4 px-6" aria-label="Tabs">
              {['general', 'notifications', 'privacy', 'appearance'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-4 text-sm font-medium transition-colors ${
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={settings.language || 'en'}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Timezone <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={settings.timezone || 'UTC'}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>

                {user && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Account Information</h3>
                    <p className="text-sm text-gray-400">Email: {user.email}</p>
                    <p className="text-sm text-gray-400">Username: {user.username}</p>
                    {user.createdAt && (
                      <p className="text-sm text-gray-400">
                        Member since: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
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
                    onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
                    className={`${
                      settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-600'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                    onClick={() => updateSetting('taskReminders', !settings.taskReminders)}
                    className={`${
                      settings.taskReminders ? 'bg-blue-600' : 'bg-gray-600'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  <div className="space-y-4">
                    <div>
                      <button
                        onClick={handleExportData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        Export Data
                      </button>
                      <p className="mt-2 text-sm text-gray-400">
                        Download all your tasks and account data in JSON format.
                      </p>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-4">
                      <button 
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                      >
                        Delete Account
                      </button>
                      <p className="mt-2 text-sm text-gray-400">
                        Once you delete your account, it cannot be recovered. All your data will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                  <select
                    value={settings.theme || 'dark'}
                    onChange={(e) => updateSetting('theme', e.target.value)}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                  <p className="mt-2 text-sm text-gray-400">
                    Choose your preferred theme. System will use your device's theme preference.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
            <p className="text-sm text-gray-400">Changes are saved when you click "Save Changes"</p>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings