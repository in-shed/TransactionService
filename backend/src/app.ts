import express, { Request, Response } from 'express';
import cors from 'cors';
import { CustomerController } from './controllers/CustomerController.js';
import { AccountController } from './controllers/AccountController.js';
import { TransactionController } from './controllers/TransactionController.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*']
}));
app.use(express.json());

// Routes
app.get('/api/customers', CustomerController.getAll);
app.get('/api/customers/:pNo', CustomerController.get);
app.post('/api/customers', CustomerController.create);
app.patch('/api/customers/:pNo', CustomerController.updateName);
app.delete('/api/customers/:pNo', CustomerController.delete);

app.get('/api/customers/:pNo/accounts/:accountId', AccountController.get);
app.post('/api/customers/:pNo/accounts/savings', AccountController.createSavings);
app.post('/api/customers/:pNo/accounts/credit', AccountController.createCredit);
app.post('/api/customers/:pNo/accounts/:accountId/deposit', AccountController.deposit);
app.post('/api/customers/:pNo/accounts/:accountId/withdraw', AccountController.withdraw);
app.delete('/api/customers/:pNo/accounts/:accountId', AccountController.close);

app.get('/api/customers/:pNo/accounts/:accountId/transactions', TransactionController.getAll);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;