import { Request, Response } from "express";
import { getRepository, getConnection, QueryRunner } from "typeorm";
import { BookOrdered } from "../entities/BookOrdered";
import { Employee } from "../entities/Employee";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export class BookOrderedController {

    /**
     * @swagger
     * /book-ordered:
     *   get:
     *     summary: Get a list of book orders
     *     description: Retrieves a list of book orders with optional filtering, sorting, and pagination.
     *     tags:
     *       - BookOrdered
     *     parameters:
     *       - in: query
     *         name: id
     *         schema:
     *           type: integer
     *       - in: query
     *         name: book_id
     *         schema:
     *           type: string
     *       - in: query
     *         name: user_id
     *         schema:
     *           type: string
     *       - in: query
     *         name: amount
     *         schema:
     *           type: string
     *       - in: query
     *         name: is_del
     *         schema:
     *           type: boolean
     *       - in: query
     *         name: price
     *         schema:
     *           type: number
     *       - in: query
     *         name: state
     *         schema:
     *           type: string
     *       - in: query
     *         name: discount
     *         schema:
     *           type: string
     *       - in: query
     *         name: bill_id
     *         schema:
     *           type: string
     *       - in: query
     *         name: orderBy
     *         schema:
     *           type: string
     *           default: id
     *       - in: query
     *         name: typeOrder
     *         schema:
     *           type: string
     *           enum: [ASC, DESC]
     *           default: ASC
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *       - in: query
     *         name: pageSize
     *         schema:
     *           type: integer
     *           default: 10
     *     responses:
     *       200:
     *         description: List of book orders
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/BookOrdered'
     *                 total:
     *                   type: integer
     *                 page:
     *                   type: integer
     *                 pageSize:
     *                   type: integer
     *       500:
     *         description: Internal server error
     */
    static get = async (req: Request, res: Response) => {
        const {
            id,
            book_id,
            user_id,
            amount,
            price,
            state,
            discount,
            bill_id,
            orderBy = 'id',
            typeOrder = 'ASC',
            is_del = false,
            page = 1,
            pageSize = 10
        } = req.query;

        const bookOrderedRepository = getRepository(BookOrdered);
        const query = bookOrderedRepository.createQueryBuilder('bookOrdered');

        
        if (id) {
            query.andWhere('bookOrdered.id = :id', { id: Number(id) });
        }
        if (is_del) {
            query.andWhere('bookOrdered.is_del = :is_del', { is_del: is_del });
        }
        if (book_id) {
            query.andWhere('bookOrdered.book_id LIKE :book_id', { book_id: `%${book_id}%` });
        }
        if (user_id) {
            query.andWhere('bookOrdered.user_id LIKE :user_id', { user_id: `%${user_id}%` });
        }
        if (amount) {
            query.andWhere('bookOrdered.amount LIKE :amount', { amount: `%${amount}%` });
        }
        if (price) {
            query.andWhere('bookOrdered.price = :price', { price: Number(price) });
        }
        if (state) {
            query.andWhere('bookOrdered.state LIKE :state', { state: `%${state}%` });
        }
        if (discount) {
            query.andWhere('bookOrdered.discount LIKE :discount', { discount: `%${discount}%` });
        }
        if (bill_id) {
            query.andWhere('bookOrdered.bill_id LIKE :bill_id', { bill_id: `%${bill_id}%` });
        }

        query.orderBy(`bookOrdered.${orderBy}`, typeOrder.toString().toUpperCase() as 'ASC' | 'DESC');

        query.skip((Number(page) - 1) * Number(pageSize)).take(Number(pageSize));

        try {
            const [bookOrders, count] = await query.getManyAndCount();

            res.status(200).send({
                data: bookOrders,
                total: count,
                page: Number(page),
                pageSize: Number(pageSize),
            });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).send({ message: 'Error retrieving book orders', error: error.message });
            } else {
                res.status(500).send({ message: 'Error retrieving book orders', error: String(error) });
            }
        }
    }

    /**
     * @swagger
     * /book-ordered:
     *   post:
     *     summary: Create a new book order
     *     description: Creates a new book order.
     *     tags:
     *       - BookOrdered
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               book_id:
     *                 type: string
     *               user_id:
     *                 type: string
     *               amount:
     *                 type: string
     *               price:
     *                 type: number
     *               state:
     *                 type: string
     *               discount:
     *                 type: string
     *               bill_id:
     *                 type: string
     *               regdate:
     *                 type: string
     *                 format: date-time
     *               last_update:
     *                 type: string
     *                 format: date-time
     *     responses:
     *       201:
     *         description: Book order created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Book order created successfully"
     *                 bookOrdered:
     *                   $ref: '#/components/schemas/BookOrdered'
     *       401:
     *         description: Unauthorized access
     *       500:
     *         description: Internal server error
     */
    static create = async (req: Request, res: Response) => {
        const { book_id, user_id, amount, price, state, discount, bill_id } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        const queryRunner = getConnection().createQueryRunner();

        try {
            await queryRunner.startTransaction();

            // Verify token
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
            const employeeRepository = queryRunner.manager.getRepository(Employee);
            const employee = await employeeRepository.findOne({ where: { id: decoded.id } });

            if (!employee) {
                await queryRunner.rollbackTransaction();
                return res.status(403).send({ message: 'User not authorized to create orders' });
            }

            // Create new book order
            const bookOrderedRepository = queryRunner.manager.getRepository(BookOrdered);
            const newBookOrdered = new BookOrdered();
            newBookOrdered.book_id = book_id;
            newBookOrdered.user_id = user_id;
            newBookOrdered.amount = amount;
            newBookOrdered.price = price;
            newBookOrdered.state = state;
            newBookOrdered.discount = discount;
            newBookOrdered.bill_id = bill_id;
            newBookOrdered.is_del = false;
            newBookOrdered.regdate = new Date();
            newBookOrdered.last_update = new Date();

            await bookOrderedRepository.save(newBookOrdered);

            await queryRunner.commitTransaction();
            res.status(201).send({ message: 'Book order created successfully', bookOrdered: newBookOrdered });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).send({ message: 'Invalid token', error: error.message });
            } else if (error instanceof Error) {
                res.status(500).send({ message: 'Error creating book order', error: error.message });
            } else {
                res.status(500).send({ message: 'Error creating book order', error: String(error) });
            }
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * @swagger
     * /book-ordered/{id}:
     *   put:
     *     summary: Update a book order
     *     description: Updates a specific book order by ID.
     *     tags:
     *       - BookOrdered
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               book_id:
     *                 type: string
     *               user_id:
     *                 type: string
     *               amount:
     *                 type: string
     *               price:
     *                 type: number
     *               state:
     *                 type: string
     *               discount:
     *                 type: string
     *               bill_id:
     *                 type: string
     *               regdate:
     *                 type: string
     *                 format: date-time
     *               last_update:
     *                 type: string
     *                 format: date-time
     *     responses:
     *       200:
     *         description: Book order updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Book order updated successfully"
     *                 bookOrdered:
     *                   $ref: '#/components/schemas/BookOrdered'
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized access
     *       404:
     *         description: Book order not found
     *       500:
     *         description: Internal server error
     */
    static update = async (req: Request, res: Response) => {
        const { id } = req.params;
        const {
            book_id,
            user_id,
            amount,
            price,
            state,
            discount,
            bill_id,
        } = req.body;

        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        const queryRunner = getConnection().createQueryRunner();

        try {
            await queryRunner.startTransaction();

            // Verify token
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
            const employeeRepository = queryRunner.manager.getRepository(Employee);
            const employee = await employeeRepository.findOne({ where: { id: decoded.id } });

            if (!employee) {
                await queryRunner.rollbackTransaction();
                return res.status(403).send({ message: 'User not authorized to update orders' });
            }

            // Update book order
            const bookOrderedRepository = queryRunner.manager.getRepository(BookOrdered);
            const bookOrdered = await bookOrderedRepository.findOne({ where: { id: Number(id) } });

            if (!bookOrdered) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ message: 'Book order not found' });
            }

            if (book_id !== undefined) bookOrdered.book_id = book_id;
            if (user_id !== undefined) bookOrdered.user_id = user_id;
            if (amount !== undefined) bookOrdered.amount = amount;
            if (price !== undefined) bookOrdered.price = price;
            if (state !== undefined) bookOrdered.state = state;
            if (discount !== undefined) bookOrdered.discount = discount;
            if (bill_id !== undefined) bookOrdered.bill_id = bill_id;
            bookOrdered.last_update = new Date();

            await bookOrderedRepository.save(bookOrdered);
            await queryRunner.commitTransaction();

            res.status(200).send({ message: 'Book order updated successfully', bookOrdered });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).send({ message: 'Invalid token', error: error.message });
            } else if (error instanceof Error) {
                res.status(500).send({ message: 'Error updating book order', error: error.message });
            } else {
                res.status(500).send({ message: 'Error updating book order', error: String(error) });
            }
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * @swagger
     * /book-ordered/{id}:
     *   delete:
     *     summary: Delete a book order
     *     description: Deletes a specific book order by ID.
     *     tags:
     *       - BookOrdered
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Book order deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Book order deleted successfully"
     *       401:
     *         description: Unauthorized access
     *       404:
     *         description: Book order not found
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

            // Verify token
            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
            const employeeRepository = queryRunner.manager.getRepository(Employee);
            const employee = await employeeRepository.findOne({ where: { id: decoded.id } });

            if (!employee) {
                await queryRunner.rollbackTransaction();
                return res.status(403).send({ message: 'User not authorized to delete orders' });
            }

            // Delete book order
            const bookOrderedRepository = queryRunner.manager.getRepository(BookOrdered);
            const bookOrdered = await bookOrderedRepository.findOne({ where: { id: Number(id) } });

            if (!bookOrdered) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ message: 'Book order not found' });
            }

            bookOrdered.is_del = true;
            await bookOrderedRepository.save(bookOrdered);
            await queryRunner.commitTransaction();

            res.status(200).send({ message: 'Book order deleted successfully' });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).send({ message: 'Invalid token', error: error.message });
            } else if (error instanceof Error) {
                res.status(500).send({ message: 'Error deleting book order', error: error.message });
            } else {
                res.status(500).send({ message: 'Error deleting book order', error: String(error) });
            }
        } finally {
            await queryRunner.release();
        }
    }
}
