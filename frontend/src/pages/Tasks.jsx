import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isValidDate, getDeadlineStatus } from '../utils/dateUtils';
import { truncateText } from '../utils/stringUtils';
import TaskForm from '../components/TaskForm';
import ConfirmDialog from '../components/ConfirmDialog';
import TaskDetails from '../components/TaskDetails';
import Tooltip from '../components/Tooltip';
import { motion, AnimatePresence } from 'framer-motion';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dateRange: 'all'
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'pending'
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: '',
    dueDate: '',
    status: ''
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    taskId: null
  });
  const [viewingTask, setViewingTask] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    try {
      const date = new Date(dateString);
      if (date instanceof Date && !isNaN(date)) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      return 'No due date';
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'No due date';
    }
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;

      let matchesDate = true;
      if (filters.dateRange !== 'all') {
        const today = new Date();
        const taskDate = new Date(task.dueDate);
        const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));

        switch (filters.dateRange) {
          case 'today':
            matchesDate = diffDays === 0;
            break;
          case 'week':
            matchesDate = diffDays >= 0 && diffDays <= 7;
            break;
          case 'month':
            matchesDate = diffDays >= 0 && diffDays <= 30;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesDate;
    });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/v2/getAllTasks/${user.email}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data.list); // Note: response includes tasks in data.list
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    // Validate due date
    if (!isValidDate(newTask.dueDate)) {
      setError('Due date cannot be in the past');
      return;
    }

    try {
      const formattedTask = {
        ...newTask,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
        email: user.email
      };
      
      const response = await fetch('http://localhost:5000/api/v2/addTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formattedTask),
      });
      if (!response.ok) throw new Error('Failed to create task');
      const data = await response.json();
      
      // Ensure the new task has the correct date format
      const newTaskWithFormattedDate = {
        ...data.list,
        dueDate: data.list.dueDate ? new Date(data.list.dueDate).toISOString() : null
      };
      
      setTasks([newTaskWithFormattedDate, ...tasks]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        status: 'pending'
      });
      setIsModalOpen(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      const formattedData = {
        ...updatedData,
        dueDate: updatedData.dueDate ? new Date(updatedData.dueDate).toISOString() : null,
        email: user.email
      };

      const response = await fetch(`http://localhost:5000/api/v2/updateTask/${taskId}`, {
        method: 'PUT', // Note: using PUT instead of PATCH
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formattedData),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const data = await response.json();
      setTasks(tasks.map(task => 
        task._id === taskId ? data.list : task
      ));
      setEditingTask(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v2/deleteTask/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: user.email }),
      });
      if (!response.ok) throw new Error('Failed to delete task');
      setTasks(tasks.filter(task => task._id !== taskId));
      setDeleteConfirmation({ isOpen: false, taskId: null });
    } catch (error) {
      setError(error.message);
    }
  };

  const initiateDelete = (taskId) => {
    setDeleteConfirmation({ isOpen: true, taskId });
  };

  const handleStatusUpdate = async (taskId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v2/updateStatus/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status,
          email: user.email
        }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      const data = await response.json();
      setTasks(tasks.map(task => 
        task._id === taskId ? data.task : task
      ));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task._id);
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      status: task.status || 'pending'
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async (taskId) => {
    try {
      await handleUpdateTask(taskId, editForm);
      setEditingTask(null);
    } catch (error) {
      setError('Failed to update task');
    }
  };

  const filterContainerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.4
      }
    }
  };

  const filterItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.2
      }
    },
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  // Add these animation variants after your existing variants
  const searchVariants = {
    initial: { 
      scale: 0.95,
      opacity: 0,
      y: -20
    },
    animate: { 
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.5,
        bounce: 0.3
      }
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <motion.button
            variants={buttonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 shadow-lg"
          >
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              New Task
            </motion.span>
          </motion.button>
        </div>

        {/* Search and Filters */}
        <motion.div 
          className="mb-8 space-y-6"
          variants={filterContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Search Bar with Animation */}
          <motion.div 
            className="relative"
            variants={filterItemVariants}
          >
            <motion.div 
              className="flex items-center bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-700/50"
              variants={searchVariants}
              initial="initial"
              animate="animate"
              whileFocus={{ scale: 1.02 }}
              whileHover={{ scale: 1.01 }}
            >
              <motion.div
                animate={{
                  rotate: searchQuery ? [0, 360] : 0
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut"
                }}
              >
                <svg 
                  className={`w-5 h-5 ${searchQuery ? 'text-blue-500' : 'text-gray-400'}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </motion.div>
              <motion.input
                type="text"
                placeholder="Search tasks by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-white placeholder-gray-400 ml-3"
                whileFocus={{ scale: 1.01 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0, rotate: -90 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, rotate: 90 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-300"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M6 18L18 6M6 6l12 12" 
                      />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
            <AnimatePresence>
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 text-sm text-gray-400"
                >
                  Found: {getFilteredTasks().length} tasks
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Filters Section */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            variants={filterItemVariants}
          >
            {/* Status Filter */}
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-700/50">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-transparent text-white border-0 outline-none cursor-pointer appearance-none"
                >
                  <option value="all" className="bg-gray-800">All Status</option>
                  <option value="pending" className="bg-gray-800">Pending</option>
                  <option value="in-progress" className="bg-gray-800">In Progress</option>
                  <option value="completed" className="bg-gray-800">Completed</option>
                </select>
              </div>
            </motion.div>

            {/* Priority Filter */}
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-700/50">
                <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full bg-transparent text-white border-0 outline-none cursor-pointer appearance-none"
                >
                  <option value="all" className="bg-gray-800">All Priority</option>
                  <option value="low" className="bg-gray-800">Low</option>
                  <option value="medium" className="bg-gray-800">Medium</option>
                  <option value="high" className="bg-gray-800">High</option>
                </select>
              </div>
            </motion.div>

            {/* Date Range Filter */}
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-gray-700/50">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full bg-transparent text-white border-0 outline-none cursor-pointer appearance-none"
                >
                  <option value="all" className="bg-gray-800">All Time</option>
                  <option value="today" className="bg-gray-800">Due Today</option>
                  <option value="week" className="bg-gray-800">Next 7 Days</option>
                  <option value="month" className="bg-gray-800">Next 30 Days</option>
                </select>
              </div>
            </motion.div>
          </motion.div>

          {/* Clear Filters Button */}
          <AnimatePresence>
            {(filters.status !== 'all' || filters.priority !== 'all' || filters.dateRange !== 'all' || searchQuery) && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={() => {
                  setFilters({ status: 'all', priority: 'all', dateRange: 'all' });
                  setSearchQuery('');
                }}
                className="flex items-center space-x-2 text-sm text-blue-500 hover:text-blue-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear Filters</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-md">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : getFilteredTasks().length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              {tasks.length === 0 ? "No tasks found. Create your first task!" : "No tasks match your filters."}
            </p>
          ) : (
            getFilteredTasks().map(task => {
              const deadlineStatus = getDeadlineStatus(task.dueDate);
              
              return (
                <div
                  key={task._id}
                  className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  {editingTask === task._id ? (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveEdit(task._id);
                    }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400">Title</label>
                          <input
                            type="text"
                            name="title"
                            value={editForm.title}
                            onChange={handleEditFormChange}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400">Description</label>
                          <textarea
                            name="description"
                            value={editForm.description}
                            onChange={handleEditFormChange}
                            rows="3"
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400">Priority</label>
                            <select
                              name="priority"
                              value={editForm.priority}
                              onChange={handleEditFormChange}
                              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-400">Status</label>
                            <select
                              name="status"
                              value={editForm.status}
                              onChange={handleEditFormChange}
                              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400">Due Date</label>
                          <input
                            type="date"
                            name="dueDate"
                            value={editForm.dueDate}
                            onChange={handleEditFormChange}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                          />
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setEditingTask(null)}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-medium text-white">{task.title}</h3>
                        <p className="text-gray-400 mt-2">
                          {truncateText(task.description, 150)}
                          {task.description?.length > 150 && (
                            <button
                              onClick={() => setViewingTask(task)}
                              className="ml-1 text-blue-500 hover:text-blue-400 text-sm"
                            >
                              Read more
                            </button>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Tooltip text="View Details">
                            <button
                              onClick={() => setViewingTask(task)}
                              className="p-2 text-blue-500 hover:text-blue-400 transition-colors"
                            >
                              <svg 
                                className="w-5 h-5" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                                />
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                                />
                              </svg>
                            </button>
                          </Tooltip>

                          {/* Status Control Buttons */}
                          <div className="flex items-center space-x-2">
                            <Tooltip text="Mark as In Progress">
                              <button
                                onClick={() => handleStatusUpdate(task._id, 'in-progress')}
                                className={`p-2 rounded-full ${
                                  task.status === 'in-progress'
                                    ? 'bg-yellow-500/20 text-yellow-500'
                                    : 'bg-gray-700 text-gray-400 hover:text-yellow-500'
                                }`}
                              >
                                <svg 
                                  className="w-5 h-5" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                  />
                                </svg>
                              </button>
                            </Tooltip>

                            <Tooltip text="Mark as Completed">
                              <button
                                onClick={() => handleStatusUpdate(task._id, 'completed')}
                                className={`p-2 rounded-full ${
                                  task.status === 'completed'
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'bg-gray-700 text-gray-400 hover:text-green-500'
                                }`}
                              >
                                <svg 
                                  className="w-5 h-5" 
                                  fill="none" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth="2" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              </button>
                            </Tooltip>

                            <Tooltip text="Mark as Pending">
                              <button
                                onClick={() => handleStatusUpdate(task._id, 'pending')}
                                className={`p-2 rounded-full ${
                                  task.status === 'pending'
                                    ? 'bg-red-500/20 text-red-500'
                                    : 'bg-gray-700 text-gray-400 hover:text-red-500'
                                }`}
                              >
                                <svg 
                                  className="w-5 h-5" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </button>
                            </Tooltip>
                          </div>

                          <Tooltip text="Edit Task">
                            <button
                              onClick={() => handleEditClick(task)}
                              className="p-2 text-blue-500 hover:text-blue-400"
                            >
                              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </button>
                          </Tooltip>

                          <Tooltip text="Delete Task" position="right">
                            <button
                              onClick={() => initiateDelete(task._id)}
                              className="p-2 text-red-500 hover:text-red-400"
                            >
                              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-green-500/10 text-green-500'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-gray-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <span className={`${deadlineStatus.color}`}>
                        {deadlineStatus.text}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                      task.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create Task Modal */}
        {isModalOpen && (
          <TaskForm
            task={newTask}
            onSubmit={handleCreateTask}
            onChange={(e) => {
              const { name, value } = e.target;
              setNewTask(prev => ({
                ...prev,
                [name]: value
              }));
            }}
            onCancel={() => setIsModalOpen(false)}
          />
        )}

        {/* Edit Task Modal */}
        {editingTask && (
          <TaskForm
            task={editForm}
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateTask(editingTask, editForm);
            }}
            onChange={(e) => {
              const { name, value } = e.target;
              setEditForm(prev => ({
                ...prev,
                [name]: value
              }));
            }}
            onCancel={() => setEditingTask(null)}
            title="Edit Task"
            submitText="Save Changes"
          />
        )}

        <ConfirmDialog
          isOpen={deleteConfirmation.isOpen}
          onClose={() => setDeleteConfirmation({ isOpen: false, taskId: null })}
          onConfirm={() => handleDeleteTask(deleteConfirmation.taskId)}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
        />

        {viewingTask && (
          <TaskDetails
            task={viewingTask}
            onClose={() => setViewingTask(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Tasks;