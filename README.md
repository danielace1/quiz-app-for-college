# 🚀 Quiz Craze

**Quiz Craze** is a smart quiz platform built with React and Firebase. It empowers educators to create engaging tests and allows students to take them seamlessly. Ideal for classrooms, colleges, or any learning environment looking to assess knowledge effectively.

![Quiz Craze Preview](https://quiz-craze-pi.vercel.app/preview-image.jpg)

### 🌍 [Live Demo](https://quiz-craze-pi.vercel.app)

---

## ✨ Features

### 👨‍🏫 Admin (Educator)

- Create, edit, and manage tests with multiple questions
- Monitor total users, tests, and activity
- View and manage student results
- Clear data with one click when needed

### 👩‍🎓 User (Student)

- Sign up with Register Number, Email, and Password
- Take timed quizzes with real-time answer saving
- Get instant results with correct answers
- Access previous test history (Recent Activity)

### 🌐 General

- Authentication with Firebase Auth
- Responsive UI with TailwindCSS
- Role-based routing (Admin / User)
- Zustand for global state management with persistence
- Form validation using `Zod` and `React Hook Form`

---

## 🛠️ Tech Stack

- **Frontend**: React, TailwindCSS, React Router
- **State Management**: Zustand
- **Form Validation**: Zod + React Hook Form
- **Backend**: Firebase Auth, Firestore
- **Icons**: Lucide Icons

---

## 📦 Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/danielace1/quiz-app-for-college.git
   ```

2. **Install dependencies**

```bash
npm install
```

3. **Setup Firebase**

   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)

   - Enable Authentication (Email/Password)

   - Enable Firestore Database

   - Add your Firebase config in `src/firebase/index.js`

   - Add environment variables as per the `.env.example` file

4. **Run the App**

   ```bash
   npm run dev
   ```

5. **Open in Browser** and navigate to `http://localhost:5173`

## 🤝 Contributing

We welcome contributions to **Quiz Craze**! If you'd like to contribute, please follow these steps:

1. [Fork](https://github.com/danielace1/quiz-app-for-college/fork) the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/YourFeature`).
6. Create a [Pull Request](https://github.com/danielace1/quiz-app-for-college/pulls).

## 🔑 License

[MIT](./License)

## 👨‍💻 Author

- [Sudharsan](https://www.facebook.com/sudharsandaniel01)
