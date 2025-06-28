# LibraryHub

A full-stack web application for managing a digital library, with authentication, Google Books integration, borrowing, progress tracking, and user ratings.

---

## Features
- User registration and login (JWT-based authentication)
- Browse, search, and view book details
- Google Books integration (import and borrow books from Google Books)
- Borrow, return, and track reading progress
- User ratings and reviews
- Admin and member roles

---

## Project Structure

```
libraryhub/
  backend/      # Node.js, Express, Sequelize (PostgreSQL)
  frontend/     # React, Vite, Tailwind CSS
```

---

## Getting Started

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd libraryhub
```

### 2. Backend Setup
```sh
cd backend
npm install
```

#### Environment Variables
Create a `.env` file in `backend/` with your settings:
```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=localhost
JWT_SECRET=your_jwt_secret
```

#### Database
- Use PostgreSQL.
- Create the database manually if not using migrations.
- **If using migrations:**
  ```sh
  npx sequelize-cli db:migrate
  ```
- **If managing DB manually:**
  - Make sure your tables/columns match the Sequelize models.

#### Start Backend
```sh
npm run dev
```

### 3. Frontend Setup
```sh
cd ../frontend
npm install
npm run dev
```

#### Environment Variables
Create a `.env` file in `frontend/` if you use a Google Books API key:
```
VITE_GOOGLE_BOOKS_API_KEY=your_google_books_api_key
```

---

## Deployment Notes
- **Backend:** Deploy on Render or similar. Use `render-build.sh` to run migrations (if needed) and start the server.
- **Frontend:** Deploy on Vercel.
- **CORS:**
  - Add every deployed frontend domain to `allowedOrigins` in `backend/app.js`.
  - Redeploy backend after changes.
- **Database:**
  - For production, connect to your cloud PostgreSQL and ensure all required columns exist (see `backend/models/book.js`).

## Screenshots
# Landing Page
![image](https://github.com/user-attachments/assets/f70e8cd0-7222-4ecc-a193-54788415db0b)

---

## Troubleshooting

### CORS Errors
- If you see CORS errors, add your frontend domain to `allowedOrigins` in `backend/app.js` and redeploy the backend.

### Database Errors
- If you see errors like `column does not exist`, make sure your production database has all the columns defined in your Sequelize models.
- For Google Books integration, ensure columns like `googleBookId`, `isGoogleBook`, etc., exist in the `books` table.

### Mixed Content Warnings
- Always use `https://` for all image URLs (especially Google Books images) in your frontend code.

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
[MIT](LICENSE)
