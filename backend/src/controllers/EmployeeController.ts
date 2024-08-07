import { Request, Response } from "express";
import { getRepository, getConnection, QueryRunner } from "typeorm";
import { Employee } from "../entities/Employee";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY as string;

export class EmployeeController {

    /**
     * @swagger
     * /employee:
     *   post:
     *     summary: Create a new Employee
     *     tags: [Employee]
     *     parameters:
     *       - in: header
     *         name: Authorization
     *         required: true
     *         description: Bearer token for admin authorization
     *         schema:
     *           type: string
     *           example: Bearer <your_token>
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *               password:
     *                 type: string
     *               role:
     *                 type: string
     *               start_date:
     *                 type: string
     *                 format: date-time
     *               email:
     *                 type: string
     *               phone_number:
     *                 type: string
     *     responses:
     *       201:
     *         description: Employee created successfully
     *       401:
     *         description: No token provided
     *       403:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    static create = async (req: Request, res: Response) => {
        const { username, password, role, start_date, email, phone_number } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        const queryRunner = getConnection().createQueryRunner();

        try {
            await queryRunner.startTransaction();

            const decoded: any = jwt.verify(token, SECRET_KEY);
            if (decoded.role !== 'admin') {
                await queryRunner.rollbackTransaction();
                return res.status(403).send({ message: 'Unauthorized' });
            }

            // Create new employee
            const employeeRepository = queryRunner.manager.getRepository(Employee);

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            const newEmployee = new Employee();
            newEmployee.username = username;
            newEmployee.password = hashedPassword;
            newEmployee.role = role;
            newEmployee.start_date = new Date(start_date);
            newEmployee.email = email;
            newEmployee.phone_number = phone_number;
            newEmployee.is_del = false;
            newEmployee.regdate = new Date();
            newEmployee.last_login = new Date();
            newEmployee.last_update = new Date();

            await employeeRepository.save(newEmployee);



            await queryRunner.commitTransaction();

            res.status(201).send({ message: 'Employee created successfully', employee: newEmployee });
        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            res.status(500).send({ message: 'Error creating employee', error: error.message });
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * @swagger
     * /employee/{id}:
     *   get:
     *     summary: Get an Employee by ID
     *     tags: [Employee]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: ID of the employee to retrieve
     *         schema:
     *           type: integer
     *       - in: header
     *         name: Authorization
     *         required: true
     *         description: Bearer token for admin authorization
     *         schema:
     *           type: string
     *           example: Bearer <your_token>
     *     responses:
     *       200:
     *         description: Employee retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                 username:
     *                   type: string
     *                 role:
     *                   type: string
     *                 start_date:
     *                   type: string
     *                   format: date-time
     *                 email:
     *                   type: string
     *                 phone_number:
     *                   type: string
     *                 last_login:
     *                   type: string
     *                   format: date-time
     *                 register_date:
     *                   type: string
     *                   format: date-time
     *       401:
     *         description: No token provided
     *       403:
     *         description: Unauthorized
     *       404:
     *         description: Employee not found
     *       500:
     *         description: Internal server error
     */
    static get = async (req: Request, res: Response) => {
        const { id } = req.params;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        try {
            const decoded: any = jwt.verify(token, SECRET_KEY);
            if (decoded.role !== 'admin') {
                return res.status(403).send({ message: 'Unauthorized' });
            }

            const employeeRepository = getRepository(Employee);
            const employee = await employeeRepository.findOne({ where: { id: Number(id) } });

            if (!employee) {
                return res.status(404).send({ message: 'Employee not found' });
            }

            // Remove password before sending response
            const { password, ...employeeData } = employee;
            res.status(200).send({ employee: employeeData });
        } catch (error: any) {
            res.status(500).send({ message: 'Error retrieving employee', error: error.message });
        }
    }

    /**
     * @swagger
     * /employee/{id}:
     *   put:
     *     summary: Update an Employee by ID
     *     tags: [Employee]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: ID of the employee to update
     *         schema:
     *           type: integer
     *       - in: header
     *         name: Authorization
     *         required: true
     *         description: Bearer token for admin authorization
     *         schema:
     *           type: string
     *           example: Bearer <your_token>
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               username:
     *                 type: string
     *               password:
     *                 type: string
     *               role:
     *                 type: string
     *               start_date:
     *                 type: string
     *                 format: date-time
     *               email:
     *                 type: string
     *               phone_number:
     *                 type: string
     *     responses:
     *       200:
     *         description: Employee updated successfully
     *       401:
     *         description: No token provided
     *       403:
     *         description: Unauthorized
     *       404:
     *         description: Employee not found
     *       500:
     *         description: Internal server error
     */
    static update = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { username, password, role, start_date, email, phone_number } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        const queryRunner = getConnection().createQueryRunner();

        try {
            await queryRunner.startTransaction();

            const decoded: any = jwt.verify(token, SECRET_KEY);
            if (decoded.role !== 'admin') {
                await queryRunner.rollbackTransaction();
                return res.status(403).send({ message: 'Unauthorized' });
            }

            const employeeRepository = queryRunner.manager.getRepository(Employee);
            const employee = await employeeRepository.findOne({ where: { id: Number(id) } });

            if (!employee) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ message: 'Employee not found' });
            }

            if (username) employee.username = username;
            if (password) employee.password = await bcrypt.hash(password, 10);
            if (role) employee.role = role;
            if (start_date) employee.start_date = new Date(start_date);
            if (email) employee.email = email;
            if (phone_number) employee.phone_number = phone_number;
            employee.last_login = new Date();

            await employeeRepository.save(employee);
            await queryRunner.commitTransaction();

            res.status(200).send({ message: 'Employee updated successfully', employee });
        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            res.status(500).send({ message: 'Error updating employee', error: error.message });
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * @swagger
     * /employee/{id}:
     *   delete:
     *     summary: Delete an Employee by ID
     *     tags: [Employee]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: ID of the employee to delete
     *         schema:
     *           type: integer
     *       - in: header
     *         name: Authorization
     *         required: true
     *         description: Bearer token for admin authorization
     *         schema:
     *           type: string
     *           example: Bearer <your_token>
     *     responses:
     *       200:
     *         description: Employee deleted successfully
     *       401:
     *         description: No token provided
     *       403:
     *         description: Unauthorized
     *       404:
     *         description: Employee not found
     *       500:
     *         description: Internal server error
     */
    static delete = async (req: Request, res: Response) => {
        const { id } = req.params;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        const queryRunner = getConnection().createQueryRunner();

        try {
            await queryRunner.startTransaction();

            const decoded: any = jwt.verify(token, SECRET_KEY);
            if (decoded.role !== 'admin') {
                await queryRunner.rollbackTransaction();
                return res.status(403).send({ message: 'Unauthorized' });
            }

            const employeeRepository = queryRunner.manager.getRepository(Employee);
            const employee = await employeeRepository.findOne({ where: { id: Number(id) } });

            if (!employee) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ message: 'Employee not found' });
            }

            employee.is_del = true;

            await employeeRepository.save(employee);
            await queryRunner.commitTransaction();

            res.status(200).send({ message: 'Employee deleted successfully' });
        } catch (error: any) {
            await queryRunner.rollbackTransaction();
            res.status(500).send({ message: 'Error deleting employee', error: error.message });
        } finally {
            await queryRunner.release();
        }
    }
}
