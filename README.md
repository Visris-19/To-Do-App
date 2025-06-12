# 📝 Modern Todo Application

A full-stack task management application built with the MERN stack, featuring a beautiful UI and robust functionality.

![Todo App Banner](./frontend/public/banner.png)

## ✨ Features

- 🔐 **Secure Authentication**
  - Email/Password login
  - Session management
  - Profile customization

- 📋 **Task Management**
  - Create, edit, and delete tasks
  - Set priorities and due dates
  - Track completion status
  - Task history tracking

- 👤 **User Profile**
  - Custom avatar upload
  - Bio and social links
  - Activity statistics
  - Task completion analytics

- 🎨 **Modern UI/UX**
  - Dark mode support
  - Responsive design
  - Smooth animations
  - Toast notifications

## 🛠️ Tech Stack

- **Frontend**
  - React.js with Hooks
  - Tailwind CSS
  - Framer Motion
  - React Router v6

- **Backend**
  - Node.js & Express
  - MongoDB with Mongoose
  - JWT Authentication
  - Multer for file uploads

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/Visris-19/To-Do-App.git
cd todo-app
```

2. **Install dependencies**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. **Environment Setup**
```bash
# In backend directory, create .env file:
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

# In frontend directory, create .env file:
REACT_APP_API_URL=http://localhost:5173
```

4. **Run the application**
```bash
# Start backend server
cd backend
npm run dev

# Start frontend in new terminal
cd frontend
npm run dev
```

## 📸 Screenshots

![Dashboard](./frontend/public/dashboard.png)
![Task Management](./frontend/public/tasks.png)
![Profile](./frontend/public/profile.png)

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/register` - Register new user
- `POST /api/v1/signin` - Login user
- `POST /api/v1/logout` - Logout user

### Tasks
- `GET /api/v2/tasks` - Get all tasks
- `POST /api/v2/tasks` - Create new task
- `PUT /api/v2/tasks/:id` - Update task
- `DELETE /api/v2/tasks/:id` - Delete task

### Profile
- `GET /api/v2/profile` - Get user profile
- `PUT /api/v2/profile` - Update profile
- `POST /api/v2/profile/avatar` - Upload avatar

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/your-username/todo-app/issues).

## 👨‍💻 Author

Your Name
- GitHub: [@your-username](https://github.com/Visris-19)
- LinkedIn: [Your Name](https://www.linkedin.com/in/vishal-pandey-aab2692b4/)

---

⭐️ Star this repo if you like what you see!