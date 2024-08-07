import { Request, Response } from "express";
import { getRepository, getConnection, QueryRunner } from "typeorm";
import { User } from "../entities/User";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;

export class UserController {
    
    /**
     * @swagger
     * /user:
     *   get:
     *     summary: Retrieve user information
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User information retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                   example: 1
     *                 username:
     *                   type: string
     *                   example: john_doe
     *                 email:
     *                   type: string
     *                   example: john@example.com
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    static get = async (req: Request, res: Response) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        try {
            const decoded: any = jwt.verify(token, SECRET_KEY);
            const userRepository = getRepository(User);
            const user = await userRepository.findOne({ where: { id: decoded.id } });

            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }

            const { password, ...userData } = user;
            res.status(200).send(userData);
        } catch (error: any) {
            res.status(500).send({ message: 'Error retrieving user', error: error.message });
        }
    };

    /**
     * @swagger
     * /user:
     *   put:
     *     summary: Update user information
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: User information updated successfully
     *       401:
     *         description: Unauthorized
     *       400:
     *         description: Bad request
     *       500:
     *         description: Internal server error
     */
    static update = async (req: Request, res: Response) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        const { username, email, password } = req.body;
        const queryRunner = getConnection().createQueryRunner();

        try {
            await queryRunner.startTransaction();

            const decoded: any = jwt.verify(token, SECRET_KEY);
            const userRepository = queryRunner.manager.getRepository(User);
            const user = await userRepository.findOne({ where: { id: decoded.id } });

            if (!user) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ message: 'User not found' });
            }

            if (username) user.username = username;
            if (email) user.email = email;
            if (password) user.password = await bcrypt.hash(password, 10);

            await userRepository.save(user);
            await queryRunner.commitTransaction();

            res.status(200).send({ message: 'User updated successfully', user });
        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            res.status(500).send({ message: 'Error updating user', error: error.message });
        } finally {
            await queryRunner.release();
        }
    };

    /**
     * @swagger
     * /user:
     *   delete:
     *     summary: Delete user account
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User account deleted successfully
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     *       500:
     *         description: Internal server error
     */
    static delete = async (req: Request, res: Response) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        const queryRunner = getConnection().createQueryRunner();

        try {
            await queryRunner.startTransaction();

            const decoded: any = jwt.verify(token, SECRET_KEY);
            const userRepository = queryRunner.manager.getRepository(User);
            const user = await userRepository.findOne({ where: { id: decoded.id } });

            if (!user) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ message: 'User not found' });
            }

            await userRepository.remove(user);
            await queryRunner.commitTransaction();

            res.status(200).send({ message: 'User deleted successfully' });
        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            res.status(500).send({ message: 'Error deleting user', error: error.message });
        } finally {
            await queryRunner.release();
        }
    };
}
