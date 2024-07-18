import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { Token } from "../utils/Token";

export class AuthController {
  static register = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!(username && password)) {
      return res.status(400).send({ message: "Username and password are required" });
    }

    const userRepository = getRepository(User);
    let user = await userRepository.findOne({ where: { username } });

    if (user) {
      return res.status(400).send({ message: "Username already exists" });
    }

    user = new User();
    user.username = username;
    user.password = bcrypt.hashSync(password, 8);

    await userRepository.save(user);

    return res.status(201).send({ message: "User registered successfully" });
  };

  static login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!(username && password)) {
      return res.status(400).send({ message: "Username and password are required" });
    }

    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { username } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

    return res.status(200).send({ token });
  };
}
