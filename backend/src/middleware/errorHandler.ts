import { Request, Response, NextFunction } from 'express';
import { ResourceNotFoundError, BusinessError } from '../errors/index.js';

/**
 * Hanterar fel som uppstår i Express-applikationen och skickar lämpliga HTTP-svar.
 * @param err - Felobjektet som fångats av Express.
 * @param req - Express Request-objektet.
 * @param res - Express Response-objektet.
 * @param next - Express NextFunction för att skicka vidare felhanteringen.
 * @returns Ett HTTP-svar med statuskod och felmeddelande.
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  
  if (err instanceof ResourceNotFoundError) {
    return res.status(404).json({
      status: 404,
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  if (err instanceof BusinessError) {
    return res.status(400).json({
      status: 400,
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === '57P01') {
    return res.status(503).json({
      status: 503,
      message: "Service Unavailable: Database connection lost. Kindly try again later.",
      timestamp: new Date().toISOString,
    })
  }

  return res.status(500).json({
    status: 500,
    message: "Internal server error",
    timestamp: new Date().toISOString()
  });
}