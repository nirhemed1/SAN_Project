# 🛒 SAN Project – Computer Hardware Shop Web App

## 📌 Description

SAN_Project is a simple e-commerce web application designed to manage products, users, and orders.  
The backend is built with Node.js and Express, using MongoDB for data storage.

## Project Overview

This project provides a RESTful API that allows clients to perform CRUD operations on products, users, and orders. The system is modular and scalable, following best practices in API design and project organization.

## Architecture

The backend follows the MVC (Model-View-Controller) pattern:

- **Models**: Define the structure of the data using Mongoose.  
  Examples: Product, User, Order.

- **Controllers**: Handle the business logic and interact with the database.  
  Each controller processes requests and returns the appropriate response.

- **Routes**: Define the API endpoints and route requests to the correct controller functions.  
  Organized by resource type (e.g., `/api/products`, `/api/users`).

- **Server**: The `server.js` file initializes the Express app, connects to the database, and mounts all routes.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JavaScript

