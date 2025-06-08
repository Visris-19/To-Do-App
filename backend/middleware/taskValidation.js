const validateTask = (req, res, next) => {
    const { title, body } = req.body;
    
    if (!title || title.trim().length < 3) {
        return res.status(400).json({
            message: "Title must be at least 3 characters long"
        });
    }

    if (!body || body.trim().length < 5) {
        return res.status(400).json({
            message: "Description must be at least 5 characters long"
        });
    }

    next();
};

module.exports = validateTask;