# Bill Book Management System

A responsive web application for managing bills with SQLite database integration. The application supports both desktop and mobile views.

## Features

- Create, Read, Update, and Delete (CRUD) operations for bills
- Responsive design for both desktop and mobile
- Local SQLite database
- Automatic total price calculation
- Product selection from predefined list
- Date selection
- Customer information management

## Products Supported

1. Kai Muruku
2. Achu Muruku
3. Kothu Muruku
4. Adai
5. Kambu Adai
6. Podalaga Undai
7. Adhurusam

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```bash
   npm run dev
   ```
2. In a new terminal, start the frontend:
   ```bash
   cd client
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. Fill in the bill details in the form:
   - Select date
   - Enter customer name
   - Choose product from dropdown
   - Enter quantity
   - Enter base price (total price will be calculated automatically)
2. Click "Save" to store the bill
3. Use the edit and delete buttons in the table to modify or remove bills

## Technologies Used

- Frontend:
  - React
  - Material-UI
  - Axios
- Backend:
  - Node.js
  - Express
  - SQLite3 