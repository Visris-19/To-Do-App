const mongoose = require('mongoose');

const taskHistorySchema = new mongoose.Schema({
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
        required: true
    },
    previousState: {
        type: Object,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 30 * 1000) // 30 seconds from now
    }
}, { timestamps: true });

module.exports = mongoose.model('TaskHistory', taskHistorySchema);