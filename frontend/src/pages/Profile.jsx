import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { profileService } from '../services/profileService';

const Profile = () => {

  const BACKEND_URL = 'http://localhost:5000';
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState(user?.avatar ? `${BACKEND_URL}${user.avatar}` : null);
  const [loading, setLoading] = useState(false);
  const [isViewingImage, setIsViewingImage] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    notifications: {
      email: true,
      push: true
    },
    theme: user?.theme || 'dark',
    socialLinks: {
      twitter: '',
      linkedin: '',
      github: ''
    }
  });

  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    streak: 0,
    completionRate: 0
  });

  const [showTooltip, setShowTooltip] = useState(false);

  const fetchTaskStats = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/v2/getAllTasks/${user.email}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch task statistics');
      }

      const data = await response.json();
      const taskList = Array.isArray(data.list) ? data.list : [];

      // Calculate stats similar to Dashboard
      const totalTasks = taskList.length;
      const completedTasks = taskList.filter(task => task.status === 'completed').length;
      
      setTaskStats({
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 
          ? ((completedTasks / totalTasks) * 100).toFixed(1) 
          : 0,
        streak: calculateStreak(taskList)
      });

    } catch (error) {
      console.error('Error fetching task stats:', error);
      toast.error('Failed to load task statistics');
      setTaskStats({
        totalTasks: 0,
        completedTasks: 0,
        streak: 0,
        completionRate: 0
      });
    }
  };

  // Update the calculateStreak function to use task.status
  const calculateStreak = (tasks) => {
    if (!tasks.length) return 0;
    
    const completedTasks = tasks
      .filter(task => task.status === 'completed')  // Changed from isCompleted to status === 'completed'
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    if (!completedTasks.length) return 0;

    let streak = 1;
    const today = new Date().setHours(0, 0, 0, 0);
    let lastDate = new Date(completedTasks[0].updatedAt).setHours(0, 0, 0, 0);

    if (lastDate < today - 86400000) return 0;

    for (let i = 1; i < completedTasks.length; i++) {
      const currentDate = new Date(completedTasks[i].updatedAt).setHours(0, 0, 0, 0);
      const diffDays = (lastDate - currentDate) / 86400000;

      if (diffDays === 1) {
        streak++;
        lastDate = currentDate;
      } else if (diffDays > 1) {
        break;
      }
    }

    return streak;
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v2/profile', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
  
      const data = await response.json();
      setFormData({
        ...formData,
        username: data.username || user?.username,
        email: data.email || user?.email,
        bio: data.bio || '',
        createdAt: data.createdAt,
        socialLinks: data.socialLinks || {
          twitter: '',
          linkedin: '',
          github: ''
        },
        notifications: data.preferences?.notifications || {
          email: true,
          push: true
        },
        theme: data.preferences?.theme || 'dark'
      });
      if (data.avatar) setAvatar(`${BACKEND_URL}${data.avatar}`);
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast.error('Failed to load profile data');
    }
  };


  
  useEffect(() => {
    if (user?.email) {
      fetchProfile();
      fetchTaskStats();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await profileService.updateProfile(formData);
      setFormData(prev => ({
        ...prev,
        ...data
      }));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Fetch fresh profile data
      await fetchProfile();
    } catch (error) {
      console.error('Update Error:', error);
      if (error.message.toLowerCase().includes('unauthorized')) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error(`Failed to update profile: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await profileService.uploadAvatar(file);
      setAvatar(`${BACKEND_URL}${data.avatar}`);
      // Update formData with new avatar URL
      setFormData(prev => ({
        ...prev,
        avatar: data.avatar
      }));
      toast.success('Profile picture updated!');
      // Fetch fresh profile data
      await fetchProfile();
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      console.log('No date string provided');
      return 'N/A';
    }
    
    try {
      console.log('Formatting date:', dateString);
      // Handle ISO string format
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date created from string:', dateString);
        return 'Invalid Date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-700/50"
        >
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:space-x-8 relative">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500">
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt="Profile nhi hua load" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl text-white font-medium">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  onHoverStart={() => setShowImageMenu(true)}
                  onHoverEnd={() => setShowImageMenu(false)}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <AnimatePresence>
                    {showImageMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 shadow-xl border border-gray-700/50"
                      >
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setIsViewingImage(true)}
                            className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700/50 rounded-md transition-colors"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Photo
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center px-4 py-2 text-sm text-white hover:bg-gray-700/50 rounded-md transition-colors"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Change Photo
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </motion.div>

            <div className="flex-1 relative">
              <div className="flex justify-between items-start w-full">
                <div>
                  <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
                  <p className="text-gray-400">{user?.email}</p>
                </div>
                
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(!isEditing)}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="p-2.5 rounded-lg border border-gray-700/50 bg-gray-800/50 shadow-lg hover:bg-gray-700/50 transition-all duration-200"
                  >
                    {isEditing ? (
                      <svg 
                        className="w-5 h-5 text-blue-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                    ) : (
                      <svg 
                        className="w-5 h-5 text-blue-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                        />
                      </svg>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 -bottom-12 z-50"
                      >
                        <div className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg shadow-xl border border-gray-700/50 whitespace-nowrap">
                          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                          <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 border-t border-l border-gray-700/50 transform -translate-y-1/2 rotate-45" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
    >
      <div className="bg-gray-700/50 rounded-lg p-4 text-center">
        <h4 className="text-gray-400 text-sm">Total Tasks</h4>
        <p className="text-2xl font-bold text-white mt-1">{taskStats.totalTasks}</p>
      </div>
      <div className="bg-gray-700/50 rounded-lg p-4 text-center">
        <h4 className="text-gray-400 text-sm">Completed</h4>
        <p className="text-2xl font-bold text-green-500 mt-1">{taskStats.completedTasks}</p>
        <p className="text-sm text-gray-400 mt-1">
          {taskStats.completionRate}% completion rate
        </p>
      </div>
      <div className="bg-gray-700/50 rounded-lg p-4 text-center">
        <h4 className="text-gray-400 text-sm">Streak</h4>
        <p className="text-2xl font-bold text-yellow-500 mt-1">{taskStats.streak} days</p>
      </div>
    </motion.div>

          {/* Profile Information */}
          <div className="mt-8 border-t border-gray-700 pt-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={formData.notifications.email}
                    onChange={(e) => setFormData({ ...formData, notifications: { ...formData.notifications, email: e.target.checked } })}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="notifications" className="ml-2 text-sm text-gray-300">
                    Enable email notifications
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pushNotifications"
                    checked={formData.notifications.push}
                    onChange={(e) => setFormData({ ...formData, notifications: { ...formData.notifications, push: e.target.checked } })}
                    className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="pushNotifications" className="ml-2 text-sm text-gray-300">
                    Enable push notifications
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Theme</label>
                  <select
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Twitter</label>
                  <input
                    type="text"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">LinkedIn</label>
                  <input
                    type="text"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">GitHub</label>
                  <input
                    type="text"
                    value={formData.socialLinks.github}
                    onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: e.target.value } })}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-6 text-gray-300">
                <div>
                  <h3 className="text-lg font-medium text-white">Bio</h3>
                  <p className="mt-1">{formData.bio || 'No bio added yet.'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">Preferences</h3>
                  <ul className="mt-2 space-y-2">
                    <li>Theme: {formData.theme.charAt(0).toUpperCase() + formData.theme.slice(1)}</li>
                    <li>Email Notifications: {formData.notifications.email ? 'Enabled' : 'Disabled'}</li>
                    <li>Push Notifications: {formData.notifications.push ? 'Enabled' : 'Disabled'}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">Social Links</h3>
                  <ul className="mt-2 space-y-2">
                    <li>Twitter: {formData.socialLinks.twitter || 'Not added'}</li>
                    <li>LinkedIn: {formData.socialLinks.linkedin || 'Not added'}</li>
                    <li>GitHub: {formData.socialLinks.github || 'Not added'}</li>
                  </ul>
                </div>

                <div>
  <h3 className="text-lg font-medium text-white">Account Statistics</h3>
  <ul className="mt-2 space-y-2">
    <li>Total Tasks: {taskStats.totalTasks}</li>
    <li>Completed Tasks: {taskStats.completedTasks}</li>
    <li>Completion Rate: {taskStats.completionRate}%</li>
    <li>Current Streak: {taskStats.streak} days</li>
    <li>Member Since: {formatDate(formData.createdAt || user?.createdAt)}</li>
  </ul>
</div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Add the Image Viewing Modal here, just before the closing motion.div */}
      <AnimatePresence>
        {isViewingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsViewingImage(false)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-gray-800 rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="aspect-square relative">
                {avatar && (
                  <img 
                    src={avatar} 
                    alt={`${user?.username}'s profile`}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                  <h3 className="text-white font-medium">Profile Photo</h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsViewingImage(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;