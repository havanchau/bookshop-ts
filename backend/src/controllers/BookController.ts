import { Request, Response } from "express";
import { getRepository, getConnection, QueryRunner } from "typeorm";
import { Book } from "../entities/Book";
import { Employee } from "../entities/Employee";
import jwt from 'jsonwebtoken';

export default class BookController {

        /**
     * @swagger
     * /books:
     *   post:
     *     summary: Create a new book
     *     description: Allows an authorized employee to create a new book.
     *     tags:
     *       - Books
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title:
     *                 type: string
     *                 example: "Book Title"
     *               author:
     *                 type: string
     *                 example: "Author Name"
     *               cost:
     *                 type: number
     *                 example: 19.99
     *               edition:
     *                 type: string
     *                 example: "1st Edition"
     *     responses:
     *       201:
     *         description: Book created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Book created successfully"
     *                 book:
     *                   $ref: '#/components/schemas/Book'
     *       401:
     *         description: No token provided or invalid token
     *       403:
     *         description: User not authorized to create books
     *       500:
     *         description: Internal server error
     */
    static create = async (req: Request, res: Response) => {
        const { name, author, cost, discount, discription, edition, amount, saler_amount } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'No token provided' });
        }

        const queryRunner = getConnection().createQueryRunner();

        try {

            await queryRunner.startTransaction();


            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

            const employeeRepository = queryRunner.manager.getRepository(Employee);
            const employee = await employeeRepository.findOne({ where: { id: decoded.id } });

            if (!employee) {
                await queryRunner.rollbackTransaction();
                return res.status(403).send({ message: 'User not authorized to create books' });
            }

            const bookRepository = getRepository(Book);
            const newBook = new Book();
            newBook.name = name;
            newBook.author = author;
            newBook.cost = cost;
            newBook.discount = discount;
            newBook.discription = discription;
            newBook.amount = amount;
            newBook.saler_amount = saler_amount;
            newBook.edition = edition;

            await bookRepository.save(newBook);

            await queryRunner.commitTransaction();
            res.status(201).send({ message: 'Book created successfully', book: newBook });
        } catch (error) {

            await queryRunner.rollbackTransaction();
            if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).send({ message: 'Invalid token', error: error.message });
            } else if (error instanceof Error) {
                res.status(500).send({ message: 'Error creating book', error: error.message });
            } else {
                res.status(500).send({ message: 'Error creating book', error: String(error) });
            }
        } finally {
            await queryRunner.release();
        }
    }

        /**
     * @swagger
     * /books:
     *   get:
     *     summary: Retrieve a list of books
     *     description: Retrieves a paginated list of books with optional filters.
     *     tags:
     *       - Books
     *     parameters:
     *       - in: query
     *         name: id
     *         schema:
     *           type: string
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *       - in: query
     *         name: cost_up
     *         schema:
     *           type: number
     *       - in: query
     *         name: cost_down
     *         schema:
     *           type: number
     *       - in: query
     *         name: edition
     *         schema:
     *           type: string
     *       - in: query
     *         name: saler_amount
     *         schema:
     *           type: number
     *       - in: query
     *         name: orderBy
     *         schema:
     *           type: string
     *       - in: query
     *         name: typeOrder
     *         schema:
     *           type: string
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
     *         description: List of books
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Book'
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
        const { id, name, cost_up, cost_down, edition, saler_amount, orderBy, typeOrder, page = 1, pageSize = 10 } = req.body;

        const bookRepository = getRepository(Book);

        try {
            const query = bookRepository.createQueryBuilder('book');

            const [books, count] = await query.getManyAndCount();

            res.status(200).send({
                data: books,
                total: count,
                page,
                pageSize,
            });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).send({ message: 'Error retrieving books', error: error.message });
            } else {
                res.status(500).send({ message: 'Error retrieving books', error: String(error) });
            }
        }
    }
}
