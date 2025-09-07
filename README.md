# Astrape AI Project

A full-stack e-commerce , built with **React (Vite)** frontend, **Node.js + Express** backend, and **MongoDB** for the database.  

---

## Features

- User authentication and role-based access (Admin/User)  
- Product catalog with CRUD operations for admins  
- Shopping cart with add, update, remove, and clear functionality  
- Fully responsive UI  

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS  
- **Backend:** Node.js, Express, MongoDB, JWT Authentication, Bcrypt  
- **Deployment:** Netlify (Frontend), Render (Backend)  
- **Other:** Axios for API requests, react-hot-toast for notifications  

---

## Deployment Links

- **Frontend (Netlify):** [https://astrapeai.netlify.app/](https://astrapeai.netlify.app/)  
- **Backend (Render):** [https://astrape-ai.onrender.com](https://astrape-ai.onrender.com)  

---

## Environment Variables

Frontend `.env` (Vite):

```
VITE_API_URL=https://astrape-ai.onrender.com/api
```

Backend `.env`:

```bash
MONGODB_URI=<Your MongoDB URI>

JWT_SECRET=<Your JWT Secret>

PORT=3001

ADMIN_EMAIL=<Admin Email>

ADMIN_PASSWORD=<Admin Password>
```
---

## How to Run Locally

1. Clone the repository
2. Install dependencies for both `server` and `src`
3. Set environment variables in `.env` files
4. Run backend:  
   ```bash
   npm run dev:backend
5. Run frontend (Vite dev server):
   ```bash 
   npm run dev:frontend
   ```
6. Run both:
   ```bash 
    npm run start
    ```
---
