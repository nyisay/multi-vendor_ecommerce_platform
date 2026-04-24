# Multi-Vendor Ecommerce Marketplace

A full-stack marketplace web application built for a computing project assignment. The system supports three user roles:

- `Customer` for browsing products, saving wishlist items, placing orders, and tracking purchases
- `Vendor` for managing products and viewing storefront orders
- `Admin` for reviewing marketplace activity, vendors, products, users, categories, and orders

## Project Scope

This project demonstrates a marketplace workflow rather than a single-store ecommerce site. It includes:

- User authentication and role-based access control
- Product catalog with search, category browsing, advanced filtering, and compare tray
- Product detail pages with reviews, reactions, related items, and recently viewed products
- Cart, checkout, wishlist, and order history for customers
- Product management and order management for vendors
- Marketplace dashboards, category management, vendor approval, and admin controls

## Tech Stack

### Frontend

- React
- React Router
- Vite
- Tailwind CSS
- Axios

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Multer for image uploads
- Jest and Supertest for backend tests

## Main Features

### Customer Features

- Register and log in
- Browse products by category
- Search the catalog
- Filter by vendor, price, rating, and stock availability
- Compare up to three products side by side
- View product details
- Add reviews and react to other customer reviews
- Add items to cart and wishlist
- Checkout with shipping details and payment selection
- View and cancel orders
- Update profile and checkout defaults

### Vendor Features

- Access vendor dashboard
- Create, edit, and delete products
- Upload product images
- Review vendor order list
- Update vendor order status

### Admin Features

- Access admin dashboard analytics
- View marketplace users
- Approve or reject vendors
- Manage products
- Manage categories
- Manage orders

## Project Structure

```text
multi-vendor-ecommerce/
├─ backend/
│  ├─ controllers/
│  ├─ models/
│  ├─ routes/
│  ├─ middleware/
│  └─ tests/
├─ frontend/
│  ├─ src/components/
│  ├─ src/pages/
│  ├─ src/context/
│  ├─ src/services/
│  └─ src/data/
└─ README.md
```

## How To Run

### 1. Backend setup

Open a terminal in `backend` and install dependencies:

```bash
npm install
```

Create a `.env` file in `backend` with values similar to:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
FRONTEND_ORIGIN=http://localhost:5173
PORT=5000
```

Start the backend:

```bash
npm start
```

### 2. Frontend setup

Open a second terminal in `frontend` and install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The frontend runs on Vite's local server and connects to the backend API.

## Testing And Verification

### Backend tests

```bash
cd backend
npm test
```

### Frontend lint

```bash
cd frontend
npm run lint
```

### Frontend production build

```bash
cd frontend
npm run build
```

## Academic Value

This assignment demonstrates:

- Full-stack web application design
- REST API integration
- Authentication and authorization
- CRUD operations
- State management in React
- Form validation and checkout workflow
- Role-based dashboards
- Automated backend testing
- UI/UX improvement through product discovery and comparison tools

## Current Limitations

- Payment processing is simulated rather than connected to a real payment gateway
- Shipping and tracking are simplified for project scope
- The platform is designed as a coursework prototype, not a production deployment

## Suggested Report Sections

For your teacher report or viva, you can explain the project using:

1. Problem statement
2. Objectives
3. System roles and use cases
4. Tech stack choice
5. Database and API structure
6. Key features implemented
7. Testing and verification
8. Challenges faced and improvements made
9. Limitations and future work

## Submission Notes

Before final submission, include:

- Screenshots of the homepage, product catalog, product details, checkout, vendor dashboard, and admin dashboard
- A short explanation of what you implemented personally
- The commands used to run and test the project
