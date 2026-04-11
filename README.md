# EduSphere - School Management Website

A full-stack school management website using **HTML, CSS, JavaScript, Node.js, Express, and MongoDB**.

## Features included

- Authentication system
  - Student login/signup
  - Teacher login/signup
  - Admin login (seeded by environment variables)
  - Password reset
- Dashboards
  - Student dashboard: marks, attendance, report card download, notifications
  - Teacher dashboard: upload marks, attendance, announcements, assignments
  - Admin dashboard: manage users/classes, announcements, analytics
- Extra features
  - Search system
  - Dark mode toggle
  - File upload (assignments)
  - Student-teacher chat
  - Notifications/announcements
  - Calendar events

## Project structure

```
.
├── server.js
├── routes/
├── models/
├── middleware/
├── public/
│   ├── index.html
│   ├── pages/
│   │   ├── auth.html
│   │   └── dashboard.html
│   ├── css/style.css
│   ├── js/main.js
│   ├── js/auth.js
│   └── js/dashboard.js
└── .env.example
```

## Step-by-step: run locally

1. **Install Node.js** (v18+ recommended).
2. **Install MongoDB locally** or use MongoDB Atlas.
3. In project root, install packages:
   ```bash
   npm install
   ```
4. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```
5. Update `.env` values:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
6. Start project:
   ```bash
   npm run dev
   ```
7. Open `http://localhost:5000`.

## Default role flow

- **Admin**: login using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.
- **Student/Teacher**: create account from signup form.

## How to deploy online for free

### Option A: Render (Backend + Static in one service)

1. Push this project to GitHub.
2. Create a free MongoDB Atlas cluster and get connection URI.
3. Go to Render → New Web Service → connect repo.
4. Build command:
   ```bash
   npm install
   ```
5. Start command:
   ```bash
   npm start
   ```
6. Add environment variables in Render:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
7. Deploy and open generated Render URL.

### Option B: Railway

1. Push repo to GitHub.
2. Create new Railway project from GitHub.
3. Add MongoDB plugin or Atlas URI.
4. Set same env variables.
5. Deploy and use Railway domain.

## Beginner notes

- All frontend code is in `public/` with separate HTML/CSS/JS files.
- Backend REST APIs are in `routes/`.
- Database schemas are in `models/`.
- Role checks are handled in `middleware/auth.js`.

