import { Request, Response } from "express";
import { getRepository, getConnection } from "typeorm";
import { User } from "../entities/User";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { Token } from "../utils/Token";
import dotenv from 'dotenv';
import { sendMail } from "../utils/mailer";

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

        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();

        await queryRunner.startTransaction();

        try {
            user = new User();
            user.username = username;
            user.password = bcrypt.hashSync(password, 8);
            user.email = email;
            user.phone_number = phone_number;
            user.last_login = new Date();
            user.register_date = new Date();
            user.isVerified = false;

            await queryRunner.manager.save(user);

            const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1d" }); 
            const verificationUrl = `${process.env.BASE_URL}/auth/confirm/${token}`;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Email Verification',
                text: `Please verify your email by clicking the following link: ${verificationUrl}`,
            };

			await sendMail(
				user.email,
				'Email Verification',
				`<h1>Email Verification</h1>
				<p>Please verify your email by clicking the following link:</p>
				<a href="${verificationUrl}">Verify Email</a>`
			);

            await queryRunner.commitTransaction();

            return res.status(201).send({ message: "User registered successfully. Please check your email to verify your account." });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return res.status(500).send({ message: 'Error during registration process' });
        } finally {
            await queryRunner.release();
        }
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

        if (!user.isVerified) {
            return res.status(400).send({ message: "Please verify your email before logging in" });
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });

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
