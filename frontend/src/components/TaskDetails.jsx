import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDeadlineStatus } from '../utils/dateUtils';

const TaskDetails = ({ task, onClose }) => {
  const modalRef = useRef();
  const deadlineStatus = getDeadlineStatus(task.dueDate);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{task.title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  task.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                  task.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {task.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                  task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-green-500/10 text-green-500'
                }`}>
                  {task.priority} priority
                </span>
              </div>

              {/* Description with Scrollbar */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                <div className="bg-gray-700/50 rounded-lg">
                  <div className="max-h-48 overflow-y-auto p-4 custom-scrollbar">
                    <p className="text-gray-200 whitespace-pre-wrap">
                      {task.description || 'No description provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Deadline</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-white">
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className={`text-sm ${deadlineStatus.color}`}>
                    {deadlineStatus.text}
                  </span>
                </div>
              </div>

              {/* Created & Updated */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Created</h3>
                  <p className="text-white">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Last Updated</h3>
                  <p className="text-white">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 bg-gray-800/50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskDetails;