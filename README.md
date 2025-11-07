# FileSure – Full Stack Developer Intern Assignment
### Project: E-Book Store Referral & Credit System

This is the backend for the FileSure Full Stack Intern assignment. The goal was to build a complete referral and credit system for a digital e-book store.

* **Live Frontend:** [Link to your Vercel URL]
* **Live Backend:** [Link to your Render URL]
* Frontend Repo: https://github.com/GaurangShivalkar/ebook-store-frontend.git

---

### Architecture & System Design

The application is built with a modern, decoupled full-stack architecture.

* **Frontend:** Next.js (App Router) with TypeScript & Tailwind CSS.
* **Backend:** Node.js & Express with TypeScript.
* **Database:** MongoDB.
* **State Management:** Zustand (for global auth state).
* **Authentication:** JWT (JSON Web Tokens) stored in `localStorage` via Zustand's persist middleware.

#### System Data Flow

The core logic revolves around the relationship between the `User` and `Purchase` models. When a new user (ABC) signs up using a referrer's code (XYZ), the `referredBy` field on ABC's user document is set to XYZ's `_id`.

When ABC makes his *first* purchase, an atomic transaction is started to:
1.  Check if `user.hasMadeFirstPurchase` is `false`.
2.  Give ABC 2 credits.
3.  Set `user.hasMadeFirstPurchase` to `true`.
4.  Find ABC's referrer (Lina) via `user.referredBy`.
5.  Atomically increment XYZ's `credits` by 2.
6.  Commit the transaction.

---

### Local Setup


**[FOR BACKEND REPO]**

1.  Clone the repository:
    ```bash
    git clone https://github.com/GaurangShivalkar/ebook-store-bacckend.git
    cd ebook-store-backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables. Copy `.env.example` to `.env`:
    ```ini
    # Port to run on
    PORT=5000

    # Your MongoDB connection string
    MONGO_URI=your_mongodb_connection_string

    # A strong, random secret for signing JWTs
    JWT_SECRET=your_super_secret_key_here
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
    The API will be running at [http://localhost:5000](http://localhost:5000)

---

### API Endpoints

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Creates a new user. Optionally links a referrer. |
| `POST` | `/api/auth/login` | Public | Logs in a user and returns a JWT. |
| `GET` | `/api/dashboard` | Protected | Gets all referral stats for the logged-in user. |
| `GET` | `/api/purchase/products`| Public | Gets the list of dummy e-book products. |
| `POST` | `/api/purchase` | Protected | Simulates a purchase. Triggers credit logic on first buy. |
