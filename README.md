# MERN Stack Login & Forgot Password Module

A secure, responsive, and aesthetically premium authentication portal built using the MERN Stack (MongoDB, Express, React, and Node.js). 

This project implements a complete user membership flow including registration, login, secure session management, and a password recovery utility using cryptographically secure tokens.

---

## Key Features & Security Implementation

1. **Authentication & Session Management**:
   - JWT-based (JSON Web Token) authorization.
   - Stateless session design where tokens are stored in the client application and passed in the `Authorization: Bearer <token>` header for protected routes.
   - Guarded pages on the frontend using React Router wrapper components.

2. **Secure Passwords (bcrypt)**:
   - Passwords are encrypted before saving to MongoDB using a pre-save hook in Mongoose with `bcryptjs`.
   - Utilizes `10` rounds of salt generation to prevent brute force or dictionary attacks.
   - Passwords are set to `select: false` on the User model to prevent accidental leaks in API responses.

3. **Cryptographically Secure Password Recovery**:
   - Generates a cryptographically strong, random 20-byte token (using Node's native `crypto` module).
   - Hashes the token using SHA-256 before writing it to the database (`resetPasswordToken`) along with an expiration timestamp (`resetPasswordExpire` set to 10 minutes).
   - Automatically logs in the user upon successful reset by returning a fresh JWT session token.

4. **Premium Responsive User Interface**:
   - Modern glassmorphic frontend built with React (Vite) and styled with Vanilla CSS.
   - Responsive design tailored to support desktops, tablets, and smartphones.
   - Micro-animations, dark-mode gradient backgrounds, loading states, and glowing form elements.
   - Developer Assistant Integration: If an SMTP mail server is not configured, the recovery link is logged directly to the server console and sent in the API response (in development mode), allowing you to complete and test the reset loop directly from the UI.

---

## Directory Structure

```text
chandan/
├── backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Route controllers (Auth logic)
│   ├── middleware/         # Express auth middleware (JWT validation)
│   ├── models/             # Mongoose schemas (User model)
│   ├── routes/             # Express routes mapper
│   ├── utils/              # Helper utilities (SendMail service)
│   ├── .env                # Runtime environment variables (Local)
│   ├── .env.example        # Reference environment variables
│   ├── package.json        # Backend dependencies
│   └── server.js           # Server startup script
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components (ProtectedRoute)
│   │   ├── context/        # React global context (AuthContext)
│   │   ├── pages/          # Auth pages (Login, Register, Reset, Dashboard)
│   │   ├── App.jsx         # App router configuration
│   │   ├── index.css       # Core styling & Design system
│   │   └── main.jsx        # App entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
├── Login-Forgot-Password-Module.postman_collection.json  # Postman API Collection
└── README.md               # Setup Guide
```

---

## Prerequisites

Make sure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (Recommended version: `v22.15.0` or higher)
- [NPM](https://www.npmjs.com/) (Recommended version: `v10.9.2` or higher)
- [MongoDB](https://www.mongodb.com/) (Must be running locally on `mongodb://127.0.0.1:27017` or configured via a remote URI)

---

## Installation & Setup

### 1. Database Check
Ensure MongoDB is running on your computer. On Windows, you can check using PowerShell:
```powershell
Get-Service -Name MongoDB
```

### 2. Backend Setup
Navigate to the `backend` folder and install dependencies:
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Edit the `.env` file if you wish to configure a real SMTP email service (defaults are set to log reset links directly to the console for frictionless manual testing).

### 3. Frontend Setup
Navigate to the `frontend` folder and install dependencies:
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```

---

## Running the Application

For the application to work, both the Backend and Frontend servers must be running concurrently.

### Run Backend
In the `backend` directory, run:
```bash
npm start
```
*Outputs:* `Server running in development mode on port 5000` & `MongoDB Connected: 127.0.0.1`

### Run Frontend
In the `frontend` directory, run:
```bash
npm run dev
```
*Outputs:* `http://localhost:5173/`

---

## Testing API Endpoints using Postman

A Postman collection is included in the project root: `Login-Forgot-Password-Module.postman_collection.json`.

### How to use:
1. Open **Postman**.
2. Click **Import** and choose the `Login-Forgot-Password-Module.postman_collection.json` file.
3. The collection is configured with default variables:
   - `baseUrl`: `http://localhost:5000/api/auth`
   - `authToken`: (Automatically populated upon login/register)
   - `resetToken`: (Automatically populated upon calling Forgot Password in dev mode)

### Recommended Test Scenario:
1. **Register a User**: Execute `POST Register User`. This registers a new account (e.g. `jane@example.com`) and automatically saves the JWT token to the `authToken` collection variable.
2. **Retrieve Profile (Protected)**: Execute `GET Dashboard Profile (Protected)`. This reads the `authToken` variable and successfully returns the user details. If you clear the token, it will return a `401 Unauthorized` response.
3. **Login User**: Execute `POST Login User`. Logs in the user and refreshes the `authToken`.
4. **Forgot Password (Mock Email)**: Execute `POST Forgot Password`. It generates a recovery token. Since SMTP email defaults to developer fallback mode, the endpoint returns the raw reset token in the response:
   ```json
   {
     "success": true,
     "message": "If your email is registered...",
     "devToken": "a3f5f3e..."
   }
   ```
   Postman automatically extracts this token and saves it to the `resetToken` collection variable.
5. **Reset Password**: Execute `PUT Reset Password`. This sends the new password payload to the server. The server verifies the token and updates the database.
6. **Re-authenticate**: Verify that logging in with the old password now fails, and logging in with the new password succeeds.

---

## UI Verification Guide (React)

1. Open your browser and go to `http://localhost:5173/`. You will be redirected to the **Login** page since you are unauthenticated.
2. Click **Sign Up** and create an account. You will be automatically redirected to the **Dashboard**.
3. View your profile details and explore the responsive container cards. Click **Sign Out**.
4. Go to **Forgot Password** page, enter your registered email, and submit.
5. A **Developer Assistant** yellow box will appear at the bottom containing a simulated click link. Click this link.
6. Set your new password and submit. You will receive a success banner and be automatically redirected back into the Dashboard.
