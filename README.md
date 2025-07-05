# 📦 Chai Backend Project

A fully functional backend server built as part of the **Chai aur Backend Assignment** by [Hitesh Choudhary](https://github.com/hiteshchoudhary). This project implements backend features like user authentication, video upload, playlist management, tweet system, likes, subscriptions  dashboard, and more — using **Node.js**, **Express.js**, and **MongoDB**.

---

## 📁 Folder Structure

```
root/
├── public/               # Static files (e.g., uploaded videos)
│   └── temp/
├── src/
│   ├── controllers/      # Route controller logic
│   ├── models/           # Mongoose schemas
│   ├── middlewares/      # Custom middlewares (auth, error, asyncHandler)
│   ├── constants/        # App-wide constants
│   ├── DB/               # MongoDB connection config
│   ├── utils/            # Utility/helper functions
│   ├── routes/           # All route files (videos, tweets, likes, etc.)
│   ├── app.js            # Express app config
│   └── index.js          # Server entry point
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Features

- ✅ JWT-based authentication
- ✅ Video CRUD + owner info via aggregation
- ✅ Commenting system with pagination
- ✅ Tweet system (post, edit, delete)
- ✅ Likes system (for videos & comments)
- ✅ Subscriptions (toggle-based)
- ✅ Playlist management (create, update, delete, fetch)
- ✅ Channel dashboard stats (views, likes, videos, subs)
- ✅ All routes tested via **Postman**

---

## 🧰 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (Access Tokens)
- **Environment**: ES Modules (`type: "module"`)
- **Others**:  
  `mongoose-aggregate-paginate-v2`, `dotenv`, custom error handling, `asyncHandler`

---

## 🔐 Environment Variables

Create a `.env` file in root:

```env
MONGO_URI=your mongo url
PORT=set your port
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token
ACCESS_TOKEN_EXPIRY=access_token_expiry
REFRESH_TOKEN_SECRET=your_refresh_token
REFRESH_TOKEN_EXPIRY=refresh_token_expiry
CLOUDINARY_CLOUD_NAME=cloud_name
CLOUDINARY_API_KEY=api_key
CLOUDINARY_API_SECRET=api_secret
```

---

## 🛠️ Installation & Running Locally

```bash
git clone https://github.com/your-username/chai-backend.git
cd chai-backend
npm install
npm run dev
```

---

## 📮 API Testing

All routes have been thoroughly tested using **Postman**. Each controller provides clear JSON responses and meaningful error messages.

---

## 📌 Author

**Owais**  
GitHub: [codingwithowais](https://github.com/codingwithowais)

---

## 🙏 Acknowledgment

Thanks to **[Hitesh Chaudhary](https://github.com/hiteshchaudhary)** sir for guiding through this amazing backend development journey via **Chai aur Backend** series.

---


