export const isValidDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(date);
  return inputDate >= today;
};

export const getDeadlineStatus = (dueDate) => {
  if (!dueDate) return { color: 'text-gray-400', text: 'No deadline' };
  
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { color: 'text-red-500', text: 'Overdue' };
  } else if (diffDays === 0) {
    return { color: 'text-orange-500', text: 'Due today' };
  } else if (diffDays <= 2) {
    return { color: 'text-yellow-500', text: `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}` };
  } else {
    return { color: 'text-green-500', text: `${diffDays} days left` };
  }
};