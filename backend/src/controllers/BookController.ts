import { Request, Response } from "express";
import { getRepository, getConnection, QueryRunner } from "typeorm";
import { Book } from "../entities/Book";
import { Employee } from "../entities/Employee";
import jwt from 'jsonwebtoken';

export class BookController {

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
     *               name:
     *                 type: string
     *                 example: "Book Title"
     *               author:
     *                 type: string
     *                 example: "Author Name"
     *               cost:
     *                 type: number
     *                 example: "19.99"
     *               discount:
     *                 type: string
     *                 example: "10%"
     *               description:
     *                 type: string
     *                 example: "A brief description of the book."
     *               edition:
     *                 type: string
     *                 example: "1st Edition"
     *               amount:
     *                 type: number
     *                 example: 1
     *               saler_amount:
     *                 ttype: number
     *                 example: 1
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
            newBook.is_del = false;
            newBook.regdate = new Date();
            newBook.last_update = new Date();

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
     *     description: Retrieves a paginated list of books with optional filters and sorting.
     *     tags:
     *       - Books
     *     parameters:
     *       - in: query
     *         name: id
     *         schema:
     *           type: integer
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *       - in: query
     *         name: cost_up
     *         schema:
     *           type: string
     *       - in: query
     *         name: cost_down
     *         schema:
     *           type: string
     *       - in: query
     *         name: discount
     *         schema:
     *           type: string
     *       - in: query
     *         name: edition
     *         schema:
     *           type: string
     *       - in: query
     *         name: amount
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: saler_amount
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: orderBy
     *         schema:
     *           type: string
     *       - in: query
     *         name: typeOrder
     *         schema:
     *           type: string
     *           enum: [ASC, DESC]
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
        const {
            id,
            name,
            cost_up,
            cost_down,
            discount,
            edition,
            amount,
            saler_amount,
            orderBy = 'id',
            typeOrder = 'ASC',
            page = 1,
            pageSize = 10
        } = req.query;

        const bookRepository = getRepository(Book);
        const query = bookRepository.createQueryBuilder('book');

        query.andWhere('book.is_del = FALSE');
        if (id) {
            query.andWhere('book.id = :id', { id: Number(id) });
        }
        if (name) {
            query.andWhere('book.name LIKE :name', { name: `%${name}%` });
        }
        if (cost_up) {
            query.andWhere('book.cost >= :cost_up', { cost_up });
        }
        if (cost_down) {
            query.andWhere('book.cost <= :cost_down', { cost_down });
        }
        if (discount) {
            query.andWhere('book.discount LIKE :discount', { discount: `%${discount}%` });
        }
        if (edition) {
            query.andWhere('book.edition LIKE :edition', { edition: `%${edition}%` });
        }
        if (amount) {
            query.andWhere('book.amount >= :amount', { amount: Number(amount) });
        }
        if (saler_amount) {
            query.andWhere('book.saler_amount >= :saler_amount', { saler_amount: Number(saler_amount) });
        }

        query.orderBy(`book.${orderBy}`, typeOrder.toString().toUpperCase() as 'ASC' | 'DESC');

        query.skip((Number(page) - 1) * Number(pageSize)).take(Number(pageSize));

        try {
            const [books, count] = await query.getManyAndCount();

            res.status(200).send({
                data: books,
                total: count,
                page: Number(page),
                pageSize: Number(pageSize),
            });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).send({ message: 'Error retrieving books', error: error.message });
            } else {
                res.status(500).send({ message: 'Error retrieving books', error: String(error) });
            }
        }
    }

    /**
     * @swagger
     * /books/{id}:
     *   put:
     *     summary: Update a book
     *     description: Updates the details of a specific book.
     *     tags:
     *       - Books
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *       - in: query
     *         name: author
     *         schema:
     *           type: string
     *       - in: query
     *         name: cost
     *         schema:
     *           type: number
     *       - in: query
     *         name: discount
     *         schema:
     *           type: string
     *       - in: query
     *         name: discription
     *         schema:
     *           type: string
     *       - in: query
     *         name: edition
     *         schema:
     *           type: string
     *       - in: query
     *         name: amount
     *         schema:
     *           type: number
     *       - in: query
     *         name: saler_amount
     *         schema:
     *           type: number
     *       - in: query
     *         name: is_del
     *         schema:
     *           type: boolean
     *     responses:
     *       200:
     *         description: Book updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Book updated successfully"
     *                 book:
     *                   $ref: '#/components/schemas/Book'
     *       400:
     *         description: Bad request
     *       404:
     *         description: Book not found
     *       500:
     *         description: Internal server error
     */
    static update = async (req: Request, res: Response) => {
        const { id } = req.params;
        const {
            name,
            author,
            cost,
            discount,
            discription,
            edition,
            amount,
            saler_amount,
            is_del,
        } = req.body;

        const queryRunner = getConnection().createQueryRunner();

        try {

            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).send({ message: 'No token provided' });
            }

            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
            const employeeRepository = queryRunner.manager.getRepository(Employee);
            const employee = await employeeRepository.findOne({ where: { id: decoded.id } });

            if (!employee) {
                await queryRunner.rollbackTransaction();
                return res.status(403).send({ message: 'User not authorized' });
            }

            await queryRunner.startTransaction();

            const bookRepository = queryRunner.manager.getRepository(Book);
            const book = await bookRepository.findOne({ where: { id: Number(id) } });

            if (!book) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ message: 'Book not found' });
            }

            if (name !== undefined) book.name = name;
            if (author !== undefined) book.author = author;
            if (cost !== undefined) book.cost = cost;
            if (discount !== undefined) book.discount = discount;
            if (discription !== undefined) book.discription = discription;
            if (edition !== undefined) book.edition = edition;
            if (amount !== undefined) book.amount = amount;
            if (saler_amount !== undefined) book.saler_amount = saler_amount;
            if (is_del !== undefined) book.is_del = is_del;
            book.last_update = new Date();

            await bookRepository.save(book);
            await queryRunner.commitTransaction();

            res.status(200).send({ message: 'Book updated successfully', book });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof Error) {
                res.status(500).send({ message: 'Error updating book', error: error.message });
            } else {
                res.status(500).send({ message: 'Error updating book', error: String(error) });
            }
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * @swagger
     * /books/{id}:
     *   delete:
     *     summary: Delete a book
     *     description: Deletes a specific book by its ID.
     *     tags:
     *       - Books
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Book deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: "Book deleted successfully"
     *       404:
     *         description: Book not found
     *       500:
     *         description: Internal server error
     */
    static delete = async (req: Request, res: Response) => {
        const { id } = req.params;

        const queryRunner = getConnection().createQueryRunner();

        try {

            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).send({ message: 'No token provided' });
            }

            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
            const employeeRepository = queryRunner.manager.getRepository(Employee);
            const employee = await employeeRepository.findOne({ where: { id: decoded.id } });

            if (!employee) {
                await queryRunner.rollbackTransaction();
                return res.status(403).send({ message: 'User not authorized' });
            }

            await queryRunner.startTransaction();

            const bookRepository = queryRunner.manager.getRepository(Book);
            const book = await bookRepository.findOne({ where: { id: Number(id) } });

            if (!book) {
                await queryRunner.rollbackTransaction();
                return res.status(404).send({ message: 'Book not found' });
            }

            book.is_del = true;

            await bookRepository.save(book);
            await queryRunner.commitTransaction();

            res.status(200).send({ message: 'Book deleted successfully' });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof Error) {
                res.status(500).send({ message: 'Error deleting book', error: error.message });
            } else {
                res.status(500).send({ message: 'Error deleting book', error: String(error) });
            }
        } finally {
            await queryRunner.release();
        }
    }
    
}
