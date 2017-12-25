import { Request, Response, NextFunction } from "express";
import * as jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {

    const token = req.get('x-access-token');
    if (!token) {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }

    jwt.verify(token, 'mysecretkey', (err: Error, decoded: any) => {
        if (err) {
            return res.status(403).send({
                success: false,
                message: 'Failed to authenticate token.'
            });
        } else {
            (req as any).decoded = decoded;
            next();
        }
    });
}
