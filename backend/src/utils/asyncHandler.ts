import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Hanterar asynkrona Express-funktioner och fångar eventuella fel som uppstår, vilket skickar dem vidare till nästa middleware (t.ex. en felhanterare).
 * @param fn funktionen som ska hanteras asynkront. Denna funktion tar emot Express Request, Response och NextFunction som argument och returnerar en Promise.
 * @returns ett Promise som hanterar eventuella fel och skickar dem vidare till nästa middleware.
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};