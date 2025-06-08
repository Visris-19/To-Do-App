import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tooltip = ({ children, text, position = 'top' }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positions = {
    top: '-translate-x-1/2 -translate-y-full -top-2',
    bottom: '-translate-x-1/2 translate-y-full -bottom-2',
    left: '-translate-x-full -translate-y-1/2 -left-2',
    right: 'translate-x-full -translate-y-1/2 -right-2'
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${positions[position]} left-1/2 z-50 whitespace-nowrap`}
          >
            <div className="px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg">
              {text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;