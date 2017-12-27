import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";

export function authenticate(req: Request, res: Response) {
    if (!req.body.username || !req.body.password) {
        return res.status(200).send({
            success: false,
            message: "username or password wrong!",
        });
    }

    const payload = {
        username: req.body.username,
    };

    const token = jwt.sign(payload, "mysecretkey");
    return res.send({
        success: true,
        token,
    });

}
