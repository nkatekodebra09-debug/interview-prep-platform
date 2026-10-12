# Interview Preparation Platform

MERN app for student interview practice, instructor-authored question sets, and instructor feedback.

## Project structure

- `Backend/` — Express API, routes, controllers, middleware, Mongoose models, and seed script.
- `Frontend/` — React/Vite app, with API calls in `src/api/`, reusable UI in `src/components/`, and screens in `src/pages/`.
- `postman/` — API test collection and supporting Postman files.
- Root `package.json` — shared install, development, formatting, lint, and build commands.

## Requirements

- Node.js 20.19+ (or 22.12+)
- MongoDB running locally or a MongoDB Atlas connection string

## Run locally

The application is organized into the backend in `Backend/` and the React app in `Frontend/`.

1. Run `npm install` from the repository root. The frontend is an npm workspace, so its dependencies are installed with the root dependencies.
2. Copy `Backend/.env.example` to `Backend/.env`, set `MONGODB_URI` and a unique `JWT_SECRET`.
3. Start MongoDB, then run `npm run dev` at the repository root. This starts the API on port 5000 and Vite on port 5173 (or the next available port).
4. Open the Vite URL shown in the terminal and register as a student or instructor.

For a reproducible clean install, use `npm ci` at the root. Build the production frontend from the root with `npm run build`. Use `npm run format` to format the project source and `npm run format:check` to verify formatting.

The API health endpoint is `http://localhost:5000/api/health`. Registration and login require the API and MongoDB to be available. Student accounts can log in immediately. New instructor accounts require administrator approval before login; an admin can approve them in **User management**. Instructors create question sets, add questions, and submit complete sets for admin approval; students only see approved sets containing questions and can submit answers. Instructors review submissions and give feedback. Admins can manage user access and approve/reject question sets.

To create an administrator and starter content, set `SEED_ADMIN_USERNAME`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD` in `Backend/.env`, then run `npm run seed`. The seed script creates the first admin account; use these credentials to sign in and approve instructor accounts and question sets.

## Submission packaging

Do not include `Backend/.env`, any other `.env` file, `node_modules/`, `dist/`, or the `.git/` directory in a ZIP submission. Keep `Backend/.env.example` so the assessor can configure the required variables. The root and backend `.gitignore` files exclude these local secrets and generated files. If a real secret was previously included in a shared archive or repository, rotate it before submission.
