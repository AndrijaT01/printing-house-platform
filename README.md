# Printing House Platform

Full-stack course project for a printing marketplace, built with **Angular, TypeScript, Node.js, Express and MongoDB**.

## Features
- Account registration, login and role-based interfaces (admin, customer, printing company)
- Product catalog, categories, images, comments and ratings
- Shopping cart and order management
- Tender / bidding workflows for companies and printing providers
- Profile and password-management flows

> Educational project, not production-ready. Authentication and data validation should be strengthened before public deployment.

## Structure
- `frontend/` — Angular application
- `backend/` — Express REST API, Mongoose models and MongoDB integration

## Local setup
Requirements: Node.js, npm and a local MongoDB server.

```bash
cd backend
npm ci
npm run build
npm run serve
```

The backend defaults to `http://localhost:4000` and expects MongoDB at `mongodb://127.0.0.1:27017/printing_house`.
In a second terminal:

```bash
cd frontend
npm ci
npm start
```

Use Angular's development URL printed in the terminal. Database fixtures are intentionally excluded from this public package because the provided exports contain user records and hashed passwords. Prepare your own non-sensitive sample data if required.

## Known limitations
- No confirmed product wishlist feature in this snapshot
- No implemented external payment provider or reporting dashboard
- Not security-audited or production-tested

## Context
Developed as an academic full-stack programming project. Do not deploy this educational prototype publicly without a separate security review.
