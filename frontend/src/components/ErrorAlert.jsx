import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ErrorAlert = ({ errors = {}, className = "", onDismiss }) => {
  const errorEntries = Object.entries(errors).filter(([key, value]) => value);
  
  if (errorEntries.length === 0) return null;

  const handleDismissError = (field) => {
    if (onDismiss) {
      onDismiss(field);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: -50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      x: 50,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className={`space-y-2 ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <AnimatePresence>
          {errorEntries.map(([field, message]) => (
            <motion.div 
              key={field}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              className="flex items-start p-3 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm shadow-lg"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 4px 20px rgba(239, 68, 68, 0.2)"
              }}
            >
              <div className="flex-shrink-0">
                <motion.svg 
                  className="w-4 h-4 text-red-500 mt-0.5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                    clipRule="evenodd" 
                  />
                </motion.svg>
              </div>
              <div className="ml-2 flex-1">
                <motion.p 
                  className="text-sm text-red-400 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {message}
                </motion.p>
              </div>
              {onDismiss && (
                <motion.button
                  onClick={() => handleDismissError(field)}
                  className="flex-shrink-0 ml-2 text-red-400 hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded-full p-1"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 90
                  }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.3 }}
                  aria-label="Dismiss error"
                >
                  <svg 
                    className="w-3 h-3" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorAlert;