# Node.js Skill Demo Project

This project is a REST API for tracking money transactions.

## What This Project Demonstrates

- Building a REST API with Express
- Clean folder structure using routes, controllers, services, and repositories
- Input validation and user friendly error handling
- Reading and writing JSON data with the Node.js file system API
- Automated API testing with Node test runner and Supertest

## Project Features

- Create a transaction
- Get all transactions
- Get one transaction by id
- Update a transaction
- Delete a transaction
- View summary totals such as income, expense, balance, and totals by category
- Health endpoint to confirm that the API is running

## Tech Stack

- Node.js
- Express
- Supertest
- Node test runner

## Folder Structure

```text
node1/
  data/
    transactions.json
  src/
    controllers/
      transactions.controller.js
    middleware/
      error.middleware.js
    repositories/
      transaction.repository.js
    routes/
      transactions.routes.js
    services/
      transaction.service.js
    utils/
      validators.js
    app.js
    server.js
  tests/
    transactions.test.js
  package.json
  README.md
```

## Requirements

- Node.js 18 or later
- npm

## Installation

1. Open a terminal or PowerShell in this project folder.
2. Install dependencies by running this command in that terminal:

```bash
npm install
```

## Running the API

### Start in normal mode

Open a terminal or PowerShell in the project folder and run:

```bash
npm start
```

The server runs at:

- http://localhost:3000

### Start in watch mode for development

Open a terminal or PowerShell in the project folder and run:

```bash
npm run dev
```

Watch mode automatically restarts the server when you save files.

## Testing All Functionalities

Open a terminal or PowerShell in the project folder and run:

```bash
npm test
```

What is tested:

- Health endpoint
- Create transaction
- Get transaction by id
- Get all transactions
- Update transaction
- Delete transaction
- Summary calculations
- Validation errors
- Not found route handling

## API Endpoints

Base URL:

- http://localhost:3000/api

Response format:

- Successful reads and writes normally return JSON in a `{ data: ... }` envelope.
- Delete requests return HTTP 204 with no response body.
- Transactions are returned from newest to oldest by date.

### 1. Health Check

- Method: GET
- URL: /health

Example:

Run this in a terminal or PowerShell:

```bash
curl http://localhost:3000/api/health
```

### 2. Create Transaction

- Method: POST
- URL: /transactions
- Body JSON fields:
  - description: string, minimum 3 characters
  - amount: number, must be greater than 0
  - type: income or expense
  - category: string, minimum 2 characters
  - date: valid date string

Example:

Run this in a terminal or PowerShell:

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Salary",
    "amount": 2500,
    "type": "income",
    "category": "Work",
    "date": "2026-07-01"
  }'
```

### 3. Get All Transactions

- Method: GET
- URL: /transactions

Example:

Run this in a terminal or PowerShell:

```bash
curl http://localhost:3000/api/transactions
```

### 4. Get One Transaction

- Method: GET
- URL: /transactions/:id

Example:

Run this in a terminal or PowerShell:

```bash
curl http://localhost:3000/api/transactions/YOUR_ID_HERE
```

### 5. Update Transaction

- Method: PUT
- URL: /transactions/:id
- Body: same structure as create

Example:

Run this in a terminal or PowerShell:

```bash
curl -X PUT http://localhost:3000/api/transactions/YOUR_ID_HERE \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated salary",
    "amount": 2700,
    "type": "income",
    "category": "Work",
    "date": "2026-07-02"
  }'
```

### 6. Delete Transaction

- Method: DELETE
- URL: /transactions/:id

Example:

Run this in a terminal or PowerShell:

```bash
curl -X DELETE http://localhost:3000/api/transactions/YOUR_ID_HERE
```

### 7. Get Summary

- Method: GET
- URL: /transactions/summary

Example:

Run this in a terminal or PowerShell:

```bash
curl http://localhost:3000/api/transactions/summary
```

Example response meaning:

- income: total of income transactions
- expense: total of expense transactions
- balance: income minus expense
- count: number of transactions
- byCategory: total amount per category

## Beginner Notes

- If you see port already in use, close the old server process and run npm start again.
- Data is stored in data/transactions.json.
- If you want a fresh state, you can clear the file at data/transactions.json and keep [] as the content.
- Tests reset the data file before each scenario so tests stay reliable.

## Learning Path Suggestion

1. Start with src/app.js to understand middleware order.
2. Read routes file to see endpoint mapping.
3. Read controller file to understand request and response flow.
4. Read service file to understand business logic.
5. Read repository file to understand file based persistence.
6. Run tests and inspect each test case.

## License

MIT
