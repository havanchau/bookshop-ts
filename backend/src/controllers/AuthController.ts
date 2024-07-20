import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { Token } from "../utils/Token";
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;

export class AuthController {
	static register = async (req: Request, res: Response) => {
		const { username, password, email, phone_number } = req.body;
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
		user.email = email;
		user.phone_number = phone_number;
		user.last_login = new Date();
		user.register_date = new Date();

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

	static async confirm(req: Request, res: Response) {
		const { token } = req.params;

		try {
			const decoded: any = jwt.verify(token, SECRET_KEY);
			const userRepository = getRepository(User);
			const user = await userRepository.findOne(decoded.userId);

			if (!user) {
				return res.status(400).json({ message: 'Invalid token' });
			}

			user.isVerified = true;
			await userRepository.save(user);

			res.status(200).json({ message: 'Email confirmed successfully' });
		} catch (error) {
			res.status(400).json({ message: 'Invalid or expired token' });
		}
	}
}
