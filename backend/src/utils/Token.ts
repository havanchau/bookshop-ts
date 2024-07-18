import * as jwt from "jsonwebtoken";

export class Token {
    static generateToken(userId: number) {
        return jwt.sign({ userId }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
    }
}
