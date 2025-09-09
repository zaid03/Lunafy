# Lunafy

<p align="center">
    <img src="frontend/src/assets/logo.png" alt="Lunafy Logo" width="120" />
</p>

<p align="center">
    <b>Lunafy</b> is a Spotify-powered web application that connects with your Spotify account to analyze your listening habits, visualize stats, and offer musical insights.
</p>

<p align="center">
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
    <img src="https://img.shields.io/badge/Frontend-React-blue" alt="Frontend: React">
    <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green" alt="Backend: Node.js | Express">
    <img src="https://img.shields.io/badge/Database-MySQL-orange" alt="Database: MySQL">
</p>

---

## 🚀 Project Status

**Lunafy backend and frontend are fully implemented**, featuring user authentication, Spotify integration, personalized stats, playlist creation, and more. <br>
<b>Admin panel development is planned next.</b>

---

## ✨ Features

- 🎵 Spotify authentication and integration
- 📊 Personalized music stats and insights
- 🎼 Playlist creation based on your top tracks
- 📧 Email verification for account security
- 📱 Responsive React frontend

---

## 🗂️ Project Structure

```
Lunafy/
├── backend/           # Node.js backend (Express + Spotify OAuth)
│   ├── controller/    # Route controllers (business logic)
│   ├── models/        # Database models/queries
│   ├── routes/        # API route definitions
│   ├── config/        # DB and environment config
│   └── server.js      # Main backend entry point
└── frontend/          # React frontend (User interface)
        └── src/
                ├── assets/
                ├── components/    # React components
                └── App.js         # Main React app entry point
```

---

## 🛠️ Tech Stack

- **Frontend:** React
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Authentication:** Spotify OAuth 2.0
- **Email:** Nodemailer (Gmail SMTP)
- **State Management:** React useState/useEffect (no Redux)
- **HTTP Client:** Axios

---

## 🌐 Hosting

- **Frontend:** [Vercel](https://vercel.com/)
- **Backend:** TBD

---

## 🔒 Security

- This project uses environment variables to manage secrets (such as API keys, database credentials, and client secrets).
- **Never expose your `client_secret` or commit your `.env` file to version control.**
- Always use `.gitignore` to prevent sensitive files from being uploaded to public repositories.
- For production, use secure methods to inject environment variables (such as deployment platform secrets).

---

## ⚡ Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MySQL](https://www.mysql.com/) database
- [Spotify Developer Account](https://developer.spotify.com/dashboard/)

### 1. Clone the repository

```bash
git clone https://github.com/zaid03/Lunafy.git
cd Lunafy
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with your credentials:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=your_redirect_uri
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

Start the backend server:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

The frontend will run on [http://localhost:3000](http://localhost:3000) by default.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 📬 Contact

For questions, issues, or feedback, please open an issue or contact [terguyzaid@gmail.com](mailto:terguyzaid@gmail.com).
