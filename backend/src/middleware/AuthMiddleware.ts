import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = <string>req.headers["authorization"];
    let jwtPayload;

    try {
        jwtPayload = <any>jwt.verify(token, process.env.JWT_SECRET || "secret");
        res.locals.jwtPayload = jwtPayload;
    } catch (error) {
        return res.status(401).send({ message: "Unauthorized" });
    }

    const { userId } = jwtPayload;
    const newToken = jwt.sign({ userId }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
    res.setHeader("token", newToken);

    next();
};
