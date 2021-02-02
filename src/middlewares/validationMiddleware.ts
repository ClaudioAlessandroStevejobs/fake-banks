import {Request, Response, NextFunction} from 'express';
import {validationResult} from 'express-validator';
// ?? errors
export const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    errors.array().length > 0 ? res.status(404).json(errors) : next();
}