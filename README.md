Bookstore Shop

A full-stack bookstore application built with Node.js and React.js. This project includes a backend API developed using Node.js and TypeORM, and a frontend user interface created with React.js.
Table of Contents

    Features
    Tech Stack
    Setup Instructions
        Backend Setup
        Frontend Setup
    Usage
        Running Backend
        Running Frontend
    API Documentation
    Contributing
    License

Features

    User Management: Registration, login, and profile management.
    Book Management: Add, update, delete, and view books.
    Order Management: Place and view orders.
    Admin Dashboard: Manage users, books, and orders.

Tech Stack

    Backend: Node.js, Express.js, TypeORM, PostgreSQL
    Frontend: React.js, Axios, Bootstrap
    Others: Swagger for API documentation

Setup Instructions
Backend Setup

    Clone the Repository

    bash

git clone https://github.com/yourusername/bookstore-ts-be.git
cd bookstore-ts-be

Install Dependencies

Ensure you have Node.js installed. Install the necessary dependencies:

bash

npm install

Configure Environment Variables

Copy the .env.example file to .env and update the environment variables as needed:

bash

cp .env.example .env

    SECRET_KEY: JWT secret key
    DATABASE_URL: PostgreSQL connection string

Run Database Migrations

Ensure that PostgreSQL is running and migrate the database:

bash

npm run typeorm migration:run

Start the Server

bash

    npm start

Frontend Setup

    Clone the Repository

    bash

git clone https://github.com/yourusername/bookstore-frontend.git
cd bookstore-frontend

Install Dependencies

Ensure you have Node.js installed. Install the necessary dependencies:

bash

npm install

Run the Development Server

bash

    npm start

    The React app will start on http://localhost:3000 by default.

Usage
Running Backend

The backend will run on http://localhost:3001 by default. You can access the API documentation at http://localhost:3001/api-docs.
Running Frontend

The frontend will run on http://localhost:3000 by default. It interacts with the backend API to perform CRUD operations on books and manage user accounts.
API Documentation

API documentation is available through Swagger. Once the backend is running, you can access the Swagger documentation at http://localhost:3001/api-docs.
Contributing

Contributions are welcome! Please follow these steps:

    Fork the repository.
    Create a new branch (git checkout -b feature/your-feature).
    Make your changes.
    Commit your changes (git commit -am 'Add some feature').
    Push to the branch (git push origin feature/your-feature).
    Create a new Pull Request.

License

This project is licensed under the MIT License - see the LICENSE file for details.