# Team Setup Guide: Gym & Sports System

Follow these steps to get the project running locally on your machine.

## 1. Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MySQL Server** (running locally)
- **Git**

## 2. Clone the Repository
Open your terminal and clone the project:

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd gym-and-sports-system
```

## 3. Install Dependencies
Install the required Node.js packages:

```bash
npm install
```

## 4. Database Setup
you need to set up the database schema locally.

1.  **Log in to MySQL** via your terminal or a GUI tool (like Workbench or DBeaver):
    ```bash
    mysql -u root -p
    ```

2.  **Create the Database**:
    ```sql
    CREATE DATABASE gym_sports_system;
    USE gym_sports_system;
    ```

3.  **Run the Migration Scripts**:
    You need to execute the SQL scripts located in the `scripts/` folder to create tables and add initial data.

    *   **Option A (Command Line):**
        ```bash
        # Run from the project root
        mysql -u root -p gym_sports_system < scripts/001_create_tables.sql
        mysql -u root -p gym_sports_system < scripts/002_seed_data.sql
        ```

    *   **Option B (GUI Tool):**
        Open `scripts/001_create_tables.sql` and `scripts/002_seed_data.sql` in your SQL editor and execute them against the `gym_sports_system` database.

## 5. Environment Configuration
Create a local environment file to store your database credentials.

1.  Copy the example file:
    ```bash
    cp .env.local.example .env.local
    # On Windows Command Prompt: copy .env.local.example .env.local
    ```

2.  Open `.env.local` and update the values to match your local MySQL setup:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password  <-- CHANGE THIS MUST BE CHANGED
    ADMIN_SIGNUP_CODE=SuperSecretAdminCode123!  <-- CHANGE THIS IF NEEDED
    DB_NAME=gym_sports_system
    DB_PORT=3306
    JWT_SECRET=some-random-secret-key
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ```

## 6. Run the Application
Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 7. Default Login Credentials (from Seed Data if you injected from that files)
- **Admin**: `admin@sport.com` / `admin123`
- **Staff**: `staff@sport.com` / `staff123`
- **Student**: `student@college.edu` / `student123`