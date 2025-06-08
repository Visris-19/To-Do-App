const mongoose = require("mongoose");

// Subtask Schema
const subtaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    dependencies: [{
        type: mongoose.Types.ObjectId,
        ref: 'List.subtasks'
    }],
    reminder: {
        enabled: {
            type: Boolean,
            default: false
        },
        date: Date,
        notified: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Main List (Subject) Schema
const listSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    targetDate: {
        type: Date,
        default: () => new Date(+new Date() + 7*24*60*60*1000)
    },
    dueDate: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date
    },
    color: {
        type: String,
        default: '#3B82F6' // Default blue color
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    subtasks: [subtaskSchema],
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
listSchema.index({ user: 1, status: 1 });
listSchema.index({ user: 1, targetDate: 1 });
listSchema.index({ 'subtasks.dueDate': 1 });

// Calculate progress based on completed subtasks
listSchema.methods.calculateProgress = function() {
    if (!this.subtasks.length) return 0;
    
    const completedSubtasks = this.subtasks.filter(
        subtask => subtask.status === 'completed'
    ).length;
    
    return Math.round((completedSubtasks / this.subtasks.length) * 100);
};

// Update progress before saving
listSchema.pre('save', function(next) {
    // Update completion status
    if (this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }

    // Calculate and update progress
    this.progress = this.calculateProgress();

    // Auto-update status based on progress
    if (this.progress === 100) {
        this.status = 'completed';
        this.completedAt = this.completedAt || new Date();
    } else if (this.progress > 0) {
        this.status = 'in-progress';
    }

    next();
});

// Validate dependencies before saving subtasks
listSchema.pre('save', function(next) {
    const subtaskIds = this.subtasks.map(st => st._id.toString());
    
    // Check if all dependencies exist in the current subtasks
    const validDependencies = this.subtasks.every(subtask => 
        subtask.dependencies.every(depId => 
            subtaskIds.includes(depId.toString())
        )
    );

    if (!validDependencies) {
        next(new Error('Invalid dependency reference'));
    } else {
        next();
    }
});

module.exports = mongoose.model("List", listSchema);