import express, { Request, Response } from 'express';
import rateLimit from "express-rate-limit";
import cors from 'cors';
import helmet from 'helmet';
import { CustomerController } from './controllers/CustomerController.js';
import { AccountController } from './controllers/AccountController.js';
import { TransactionController } from './controllers/TransactionController.js';
import { errorHandler } from './middleware/errorHandler.js';
import { asyncHandler } from './utils/asyncHandler.js';

const app = express();

// Security
app.use(helmet())

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(express.json( {limit: '1mb' }));


// Routes
app.get('/api/customers', asyncHandler(CustomerController.getAll));
app.get('/api/customers/:pNo', asyncHandler(CustomerController.get));
app.post('/api/customers', asyncHandler(CustomerController.create));
app.patch('/api/customers/:pNo', asyncHandler(CustomerController.updateName));
app.delete('/api/customers/:pNo', asyncHandler(CustomerController.delete));

app.get('/api/customers/:pNo/accounts/:accountId', asyncHandler(AccountController.get));
app.post('/api/customers/:pNo/accounts/savings', asyncHandler(AccountController.createSavings));
app.post('/api/customers/:pNo/accounts/credit', asyncHandler(AccountController.createCredit));
app.post('/api/customers/:pNo/accounts/:accountId/deposit', asyncHandler(AccountController.deposit));
app.post('/api/customers/:pNo/accounts/:accountId/withdraw', asyncHandler(AccountController.withdraw));
app.delete('/api/customers/:pNo/accounts/:accountId', asyncHandler(AccountController.close));

app.get('/api/customers/:pNo/accounts/:accountId/transactions', asyncHandler(TransactionController.getAll));

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;