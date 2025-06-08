const router = require("express").Router();
const User = require("../dbmodel/user");
const List = require("../dbmodel/list");
const TaskHistory = require('../dbmodel/taskHistory');
const authMiddleware = require('../middleware/authMiddleware');

//create
router.post("/addTask", async (req,res) => {
    try {
        const { title, description, email, status, priority, dueDate } = req.body;
        const existingUser = await User.findOne({ email });
        
        if (!existingUser) {
            return res.status(404).json({ 
                message: "User not found",
                providedEmail: email
            });
        }

        const list = new List({
            title,
            description, // Changed from body to description to match schema
            status: status || 'pending',
            priority: priority || 'medium',
            dueDate: dueDate || new Date(+new Date() + 7*24*60*60*1000),
            user: existingUser._id // Changed to single user reference
        });

        await list.save();
        
        existingUser.list.push(list);
        await existingUser.save();
        
        res.status(200).json({ list });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            message: "Internal Server Error",
            error: error.message 
        });
    }
});

//update
router.put("/updateTask/:id", async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, email } = req.body; // Changed body to description
        const taskId = req.params.id;
        
        // Debug logs
        console.log('Task ID:', taskId);
        console.log('Update data:', { title, description, status, priority, dueDate });

        // Find user
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ 
                message: "User not found",
                providedEmail: email 
            });
        }

        // Check if task exists in user's list
        if (!existingUser.list.includes(taskId)) {
            return res.status(404).json({
                message: "Task not found in user's list",
                taskId: taskId
            });
        }

        // Fetch the current state of the task
        const currentTask = await List.findById(taskId);
        if (!currentTask) {
            return res.status(404).json({
                message: "Task not found in database",
                taskId: taskId
            });
        }

        // Save history
        await saveTaskHistory(taskId, currentTask.toObject(), existingUser._id);

        // Update the task
        const updatedList = await List.findByIdAndUpdate(
            taskId,
            { 
                title, 
                description, // Changed from body to description
                status: status || 'pending',
                priority: priority || 'medium',
                dueDate,
                user: existingUser._id // Changed to single user reference
            },
            { 
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({ 
            message: "Task Updated", 
            list: updatedList 
        });

    }catch (error) {
        console.log('Error updating task:', error);
        res.status(500).json({ 
            message: "Internal Server Error",
            error: error.message 
        });
    }
});

//delete
router.delete("/deleteTask/:id", async (req, res) => {
    try {
        const taskId = req.params.id;
        const { email } = req.body;

        // Find user
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ 
                message: "User not found",
                providedEmail: email 
            });
        }

        // Check if task exists in user's list
        if (!existingUser.list.includes(taskId)) {
            return res.status(404).json({
                message: "Task not found in user's list",
                taskId: taskId
            });
        }

        // Delete the task
        await List.findByIdAndDelete(taskId);

        // Remove the task from user's list
        existingUser.list.pull(taskId);
        await existingUser.save();

        res.status(200).json({ 
            message: "Task Deleted" 
        });

    } catch (error) {
        console.log('Error deleting task:', error);
        res.status(500).json({ 
            message: "Internal Server Error",
            error: error.message 
        });
    }
});
// get all tasks
router.get("/getAllTasks/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const existingUser = await User.findOne({ email }).populate("list");

        if (!existingUser) {
            return res.status(404).json({ 
                message: "User not found",
                providedEmail: email 
            });
        }

        res.status(200).json({ 
            list: existingUser.list 
        });

    } catch (error) {
        console.log('Error fetching tasks:', error);
        res.status(500).json({ 
            message: "Internal Server Error",
            error: error.message 
        });
    }
});
// get single task
router.get("/getSingleTask/:id", async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await List.findById(taskId);

        if (!task) {
            return res.status(404).json({ 
                message: "Task not found",
                taskId: taskId 
            });
        }

        res.status(200).json({ 
            list: task 
        });

    } catch (error) {
        console.log('Error fetching task:', error);
        res.status(500).json({ 
            message: "Internal Server Error",
            error: error.message 
        });
    }
});
// get user tasks
router.get("/getUserTasks/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const existingUser = await User.findOne({ email }).populate("list");

        if (!existingUser) {
            return res.status(404).json({ 
                message: "User not found",
                providedEmail: email 
            });
        }

        res.status(200).json({ 
            list: existingUser.list 
        });

    } catch (error) {
        console.log('Error fetching user tasks:', error);
        res.status(500).json({ 
            message: "Internal Server Error",
            error: error.message 
        });
    }
});
// get user tasks by id
router.get("/getUserTasksById/:id", async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await List.findById(taskId);

        if (!task) {
            return res.status(404).json({ 
                message: "Task not found",
                taskId: taskId 
            });
        }

        res.status(200).json({ 
            list: task 
        });

    } catch (error) {
        console.log('Error fetching user tasks by ID:', error);
        res.status(500).json({ 
            message: "Internal Server Error",
            error: error.message 
        });
    }
});

// update task status
router.patch("/updateStatus/:id", async (req, res) => {
    try {
        const { status, email } = req.body;
        const taskId = req.params.id;

        if (!['pending', 'in-progress', 'completed'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be: pending, in-progress, or completed"
            });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedTask = await List.findByIdAndUpdate(
            taskId,
            { status },
            { new: true }
        );

        res.status(200).json({ 
            message: "Status updated",
            task: updatedTask 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// update task priority
router.patch("/updatePriority/:id", async (req, res) => {
    try {
        const { priority, email } = req.body;
        const taskId = req.params.id;

        if (!['low', 'medium', 'high'].includes(priority)) {
            return res.status(400).json({
                message: "Invalid priority. Must be: low, medium, or high"
            });
        }

        const updatedTask = await List.findByIdAndUpdate(
            taskId,
            { priority },
            { new: true }
        );

        res.status(200).json({
            message: "Priority updated",
            task: updatedTask
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//filter
router.get("/filter", async (req, res) => {
    try {
        const { email, status, priority, dueDate } = req.query;
        
        const query = {};
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (dueDate) {
            query.dueDate = {
                $lte: new Date(dueDate)
            };
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        query.user = { $in: [existingUser._id] };
        
        const tasks = await List.find(query).sort({ createdAt: -1 });
        res.status(200).json({ tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// batch update
router.post("/batchUpdate", async (req, res) => {
    try {
        const { taskIds, status, priority, email } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const updates = {};
        if (status) updates.status = status;
        if (priority) updates.priority = priority;

        const updatedTasks = await List.updateMany(
            { 
                _id: { $in: taskIds },
                user: { $in: [existingUser._id] }
            },
            { $set: updates },
            { new: true }
        );

        res.status(200).json({
            message: "Batch update successful",
            modifiedCount: updatedTasks.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// search
router.get("/search", async (req, res) => {
    try {
        const { email, query } = req.query;
        
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const tasks = await List.find({
            user: { $in: [existingUser._id] },
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { body: { $regex: query, $options: 'i' } }
            ]
        });

        res.status(200).json({ tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// add tags
router.patch("/addTags/:id", async (req, res) => {
    try {
        const { tags, email } = req.body;
        const taskId = req.params.id;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedTask = await List.findByIdAndUpdate(
            taskId,
            { $addToSet: { tags: { $each: tags } } },
            { new: true }
        );

        res.status(200).json({
            message: "Tags added",
            task: updatedTask
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// statistics
router.get("/statistics/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const existingUser = await User.findOne({ email });
        
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const stats = await List.aggregate([
            { $match: { user: { $in: [existingUser._id] } } },
            { $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                completedTasks: {
                    $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                },
                pendingTasks: {
                    $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
                },
                highPriorityTasks: {
                    $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] }
                }
            }}
        ]);

        res.status(200).json({
            statistics: stats[0] || {
                totalTasks: 0,
                completedTasks: 0,
                pendingTasks: 0,
                highPriorityTasks: 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// undo task changes
router.post("/undo/:taskId", async (req, res) => {
    try {
        const { email } = req.body;
        const taskId = req.params.taskId;

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const history = await TaskHistory.findOne({
            taskId,
            user: existingUser._id,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!history) {
            return res.status(404).json({ message: "No recent changes to undo" });
        }

        // Restore the previous state
        const updatedTask = await List.findByIdAndUpdate(
            taskId,
            history.previousState,
            { new: true }
        );

        // Delete the history entry
        await TaskHistory.findByIdAndDelete(history._id);

        res.status(200).json({
            message: "Task restored to previous state",
            task: updatedTask
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Save task history
const saveTaskHistory = async (taskId, previousState, userId) => {
    await TaskHistory.create({
        taskId,
        previousState,
        user: userId
    });
};

// Add this new route to your existing list routes
router.get('/tasks/stats', authMiddleware, async (req, res) => {
  try {
    const totalTasks = await List.countDocuments({ user: req.user.id });
    const completedTasks = await List.countDocuments({ 
      user: req.user.id, 
      completed: true 
    });

    // Calculate streak
    const tasks = await List.find({ 
      user: req.user.id,
      completed: true 
    })
    .sort({ updatedAt: -1 })
    .limit(30); // Check last 30 days

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if any task was completed today
    const hasCompletedToday = tasks.some(task => {
      const taskDate = new Date(task.updatedAt);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === currentDate.getTime();
    });

    if (hasCompletedToday) {
      streak = 1;
      currentDate.setDate(currentDate.getDate() - 1);

      // Count consecutive days backwards
      for (let i = 0; i < tasks.length; i++) {
        const taskDate = new Date(tasks[i].updatedAt);
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate.getTime() === currentDate.getTime()) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    res.json({
      totalTasks,
      completedTasks,
      streak,
      completionRate: totalTasks ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ message: 'Error fetching task statistics' });
  }
});

module.exports = router;