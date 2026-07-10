
# Sp.market — Service & Products Marketplace

Sp.market is a full-stack marketplace platform that combines a product marketplace (Amazon-style) with a service marketplace (Fiverr-style), built as an internship project for Teyzix Core (FSWD-3, June Batch 2026).

**Live Demo:** [sp-market-iota.vercel.app](https://sp-market-iota.vercel.app)

---

## Features

- User authentication (JWT-based) with email verification
- Product & service listings with search and filters
- Real-time updates (Socket.io)
- Image uploads via Cloudinary
- Vendor/seller dashboard
- Order and booking management
- Password reset via email

---

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Axios
- Socket.io Client

**Backend**
- Node.js + Express
- MongoDB (Atlas) with Mongoose
- JWT Authentication
- Cloudinary (image storage)
- Nodemailer + Brevo SMTP (transactional emails)
- Socket.io (real-time features)

**Deployment**
- Frontend: Vercel
- Backend: Railway

---

## Project Structure

```
Sp.market/
├── Sp_frontend/         # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── .env
│
└── backend/             # Express backend
    ├── models/
    ├── controllers/
    ├── routes/
    ├── middleware/
    ├── utils/
    ├── config/
    └── .env
```

---

## Environment Variables

### Backend (`.env`)

```
MONGO_URI=
PORT=5000
JWT_SECRET=
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
CLIENT_URL=
```

### Frontend (`.env`)

```
VITE_API_URL=
VITE_SOCKET_URL=
```

---

## Getting Started Locally

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd Sp_frontend
npm install
npm run dev
```

---

## Author

**Esha Ayyaz**
