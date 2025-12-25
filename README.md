# Campus FixIt

A full-stack issue reporting and management system for campus facilities, built with React Native (Expo) and Node.js.

Demo video - https://drive.google.com/drive/folders/1xIA-fY39RmcIGFoFRnOZi2u4RDaEKsRg?usp=sharing

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Setup Instructions](#setup-instructions)

---

## ✨ Features

### Student Features
- Report campus issues with title, description, category, and optional image
- View all reported issues with filters (category, status)
- Track issue status (Open, In Progress, Resolved)
- View admin remarks on issues
- Email notification on status change (bonus)

### Admin Features
- View all campus issues with statistics dashboard
- Filter issues by category and status
- Update issue status and add remarks
- View issue details and reporter information

### Common Features
- JWT-based authentication
- Role-based access control (Student/Admin)
- Persistent login with AsyncStorage
- Image upload to Cloudinary
- Responsive UI with NativeWind

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React Native (Expo)
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Image Picker**: expo-image-picker

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Image Storage**: Cloudinary
- **Validation**: express-validator

---

## 🗄 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['student', 'admin'], default: 'student'),
  createdAt: Date
}
```

### Issue Model
```javascript
{
  title: String (required),
  description: String (required),
  category: String (enum: ['Electrical', 'Water', 'Internet', 'Infrastructure']),
  status: String (enum: ['Open', 'In Progress', 'Resolved'], default: 'Open'),
  imageUrl: String (optional),
  createdBy: ObjectId (ref: 'User'),
  remarks: [{
    text: String,
    addedBy: ObjectId (ref: 'User'),
    addedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
```
**Payload:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```
**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

#### Login
```
POST /api/auth/login
```
**Payload:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

### Student Endpoints

#### Create Issue
```
POST /api/issues
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Payload:**
```
title: "Broken light in Room 101"
description: "The ceiling light is not working"
category: "Electrical"
image: <file> (optional)
```
**Response:**
```json
{
  "message": "Issue created successfully",
  "issue": {
    "_id": "issue_id",
    "title": "Broken light in Room 101",
    "description": "The ceiling light is not working",
    "category": "Electrical",
    "status": "Open",
    "imageUrl": "cloudinary_url",
    "createdBy": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "remarks": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get My Issues
```
GET /api/issues/my-issues
Authorization: Bearer <token>
```
**Response:**
```json
{
  "count": 5,
  "issues": [...]
}
```

#### Get Issue by ID
```
GET /api/issues/:id
Authorization: Bearer <token>
```
**Response:**
```json
{
  "issue": {
    "_id": "issue_id",
    "title": "Broken light in Room 101",
    "description": "The ceiling light is not working",
    "category": "Electrical",
    "status": "In Progress",
    "imageUrl": "cloudinary_url",
    "createdBy": {...},
    "remarks": [
      {
        "_id": "remark_id",
        "text": "We'll fix this tomorrow",
        "addedBy": {...},
        "addedAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### Admin Endpoints

#### Get All Issues
```
GET /api/admin/issues?category=Electrical&status=Open
Authorization: Bearer <token>
```
**Query Parameters:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status

**Response:**
```json
{
  "count": 10,
  "filters": {
    "category": "Electrical",
    "status": "Open"
  },
  "issues": [...]
}
```

#### Update Issue
```
PUT /api/admin/issues/:id
Authorization: Bearer <token>
```
**Payload:**
```json
{
  "status": "In Progress",
  "remark": "We're working on this issue"
}
```
**Response:**
```json
{
  "message": "Issue updated successfully",
  "issue": {...}
}
```

#### Resolve Issue
```
PUT /api/admin/issues/:id/resolve
Authorization: Bearer <token>
```
**Response:**
```json
{
  "message": "Issue marked as resolved",
  "issue": {...}
}
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js
- MongoDB
- Cloudinary account

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/campus-fixit
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your API URL:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

5. Start the development server:
```bash
npm start
```

---

## 📱 Testing

### Test Accounts

**Admin:**
- Email: admin@gmail.com
- Password: 123456

**Student:**
- Email: a@gmail.com
- Password: 123456

---
