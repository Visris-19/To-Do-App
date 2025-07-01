import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { isValidDate, getDeadlineStatus } from '../utils/dateUtils';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

// Add these after the existing imports
const TIME_FILTERS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// Update the Doughnut chart options
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { 
        color: '#9CA3AF',
        padding: 20,
        font: {
          size: 12
        }
      },
      padding: {
        top: 40,
        bottom: 10
      },
      display: true,
      align: 'center',
    }
  },
  layout: {
    padding: {
      bottom: 20,
      top: 20
    }
  },
  cutout: '60%',
  radius: '95%'
};

const Dashboard = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0
  })
  const [weeklyStats, setWeeklyStats] = useState({
    labels: [],
    completed: []
  })
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Add these inside the Dashboard component
  const [timeFilter, setTimeFilter] = useState(TIME_FILTERS.WEEKLY);
  const [progressData, setProgressData] = useState({
    labels: [],
    completed: [],
    percentage: []
  });

  useEffect(() => {
    fetchTasks()
  }, [user])


  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/v2/getAllTasks/${user.email}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      // Check if data.list exists and is an array
      const taskList = Array.isArray(data.list) ? data.list : [];
      setTasks(taskList);
      calculateStats(taskList);
      calculateWeeklyProgress(taskList);
      calculateProgress(taskList, timeFilter);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Initialize with empty array on error
      setTasks([]);
      calculateStats([]);
      calculateWeeklyProgress([]);
      calculateProgress([], timeFilter);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (taskData = []) => {
    if (!Array.isArray(taskData)) {
      console.error('Invalid task data received:', taskData);
      return;
    }
  
    const stats = {
      total: taskData.length,
      completed: taskData.filter(task => task.status === 'completed').length,
      inProgress: taskData.filter(task => task.status === 'in-progress').length,
      pending: taskData.filter(task => task.status === 'pending').length
    };
    setStats(stats);
  };

  const calculateWeeklyProgress = (taskData = []) => {
    if (!Array.isArray(taskData)) {
      console.error('Invalid task data received:', taskData);
      return;
    }
  
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Initialize counts for each day
    const dailyCounts = Array(7).fill(0)
    const labels = []
  
    // Get last 7 days labels
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      labels.push(days[date.getDay()])
    }
  
    // Count completed tasks for each day
    taskData.forEach(task => {
      if (task.status === 'completed') {
        const completedDate = new Date(task.updatedAt)
        if (completedDate >= lastWeek) {
          const dayIndex = 6 - Math.floor((today - completedDate) / (24 * 60 * 60 * 1000))
          if (dayIndex >= 0 && dayIndex < 7) {
            dailyCounts[dayIndex]++
          }
        }
      }
    })
  
    setWeeklyStats({
      labels,
      completed: dailyCounts
    })
  };

  // Add this new function inside Dashboard component
  const calculateProgress = (taskData = [], filter = TIME_FILTERS.WEEKLY) => {
    const today = new Date();
    let labels = [];
    let completed = [];
    let percentage = [];

    switch (filter) {
      case TIME_FILTERS.DAILY:
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
          
          const dayTasks = taskData.filter(task => {
            const taskDate = new Date(task.updatedAt);
            return taskDate.toDateString() === date.toDateString();
          });
          
          const completedCount = dayTasks.filter(task => task.status === 'completed').length;
          completed.push(completedCount);
          percentage.push(dayTasks.length ? (completedCount / dayTasks.length * 100).toFixed(1) : 0);
        }
        break;

      case TIME_FILTERS.WEEKLY:
        // Last 4 weeks
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - (i * 7));
          labels.push(`Week ${4-i}`);
          
          const weekTasks = taskData.filter(task => {
            const taskDate = new Date(task.updatedAt);
            return taskDate >= weekStart && taskDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          });
          
          const completedCount = weekTasks.filter(task => task.status === 'completed').length;
          completed.push(completedCount);
          percentage.push(weekTasks.length ? (completedCount / weekTasks.length * 100).toFixed(1) : 0);
        }
        break;

      case TIME_FILTERS.MONTHLY:
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(today);
          date.setMonth(today.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
          
          const monthTasks = taskData.filter(task => {
            const taskDate = new Date(task.updatedAt);
            return taskDate.getMonth() === date.getMonth() && taskDate.getFullYear() === date.getFullYear();
          });
          
          const completedCount = monthTasks.filter(task => task.status === 'completed').length;
          completed.push(completedCount);
          percentage.push(monthTasks.length ? (completedCount / monthTasks.length * 100).toFixed(1) : 0);
        }
        break;
    }

    setProgressData({ labels, completed, percentage });
  };

  // Update useEffect
  useEffect(() => {
    if (tasks.length > 0) {
      calculateProgress(tasks, timeFilter);
    }
  }, [tasks, timeFilter]);

  // Update the weeklyProgressData
  const progressChartData = {
    labels: progressData.labels,
    datasets: [
      {
        label: 'Tasks Completed',
        data: progressData.completed,
        borderColor: '#3B82F6',
        tension: 0.1,
        yAxisID: 'y',
      },
      {
        label: 'Completion Rate (%)',
        data: progressData.percentage,
        borderColor: '#10B981',
        tension: 0.1,
        yAxisID: 'y1',
      }
    ]
  };

  // Chart data for weekly progress
  const weeklyProgressData = {
    labels: weeklyStats.labels,
    datasets: [{
      label: 'Tasks Completed',
      data: weeklyStats.completed,
      fill: false,
      borderColor: '#3B82F6',
      tension: 0.1
    }]
  }

  // Chart data for task distribution
  const taskDistributionData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      data: [stats.completed, stats.inProgress, stats.pending],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      borderWidth: 0
    }]
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-900 to-gray-800 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username || 'User'}!
          </h1>
          <p className="text-gray-400">
            Here's an overview of your task management and progress
          </p>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">Progress Overview</h3>
              <div className="flex space-x-2">
                {Object.values(TIME_FILTERS).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      timeFilter === filter
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[400px]">
              <Line 
                data={progressChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      title: {
                        display: true,
                        text: 'Tasks Completed',
                        color: '#9CA3AF'
                      },
                      ticks: { color: '#9CA3AF' }
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      title: {
                        display: true,
                        text: 'Completion Rate (%)',
                        color: '#9CA3AF'
                      },
                      ticks: { color: '#9CA3AF' },
                      grid: {
                        drawOnChartArea: false,
                      },
                    },
                    x: {
                      ticks: { color: '#9CA3AF' }
                    }
                  },
                  plugins: {
                    legend: {
                      labels: { color: '#9CA3AF' }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.dataset.label || '';
                          const value = context.parsed.y;
                          return `${label}: ${value}${context.dataset.yAxisID === 'y1' ? '%' : ''}`;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-white text-lg font-semibold mb-4">Task Distribution</h3>
            <div className="h-[350px]"> {/* Reduced height for task distribution */}
              <Doughnut 
                data={taskDistributionData} 
                options={doughnutOptions}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid - Moved below charts */}
    
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 m-10">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-gray-400 text-sm font-medium">Total Tasks</h3>
              <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
            </div>
    
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-gray-400 text-sm font-medium">Completed</h3>
              <p className="text-3xl font-bold text-green-500 mt-2">{stats.completed}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-gray-400 text-sm font-medium">In Progress</h3>
              <p className="text-3xl font-bold text-yellow-500 mt-2">{stats.inProgress}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-gray-400 text-sm font-medium">Pending</h3>
              <p className="text-3xl font-bold text-red-500 mt-2">{stats.pending}</p>
            </div>
          </div>

          {/* Recent Tasks Section */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white text-lg font-semibold">Recent Tasks</h3>
            <Link to="/tasks" className="text-blue-500 hover:text-blue-400">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {Array.isArray(tasks) && tasks.length > 0 ? (
              tasks.slice(0, 5).map(task => {
                const deadlineStatus = getDeadlineStatus(task.dueDate);
                return (
                  <div key={task._id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center flex-grow">
                      <div className={`w-3 h-3 rounded-full mr-4 ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'in-progress' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <div className="flex-grow">
                        <h4 className="text-white font-medium">{task.title}</h4>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-400">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                          <p className={`text-sm ml-4 ${deadlineStatus.color}`}>
                            {deadlineStatus.text}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-green-500/10 text-green-500'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center py-4">No tasks found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard